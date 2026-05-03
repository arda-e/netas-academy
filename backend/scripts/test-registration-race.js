/**
 * Concurrency test for event registration race condition fix.
 *
 * Launches N concurrent registration requests with the same event + email,
 * then asserts exactly 1 registration row exists for that (student, event) pair.
 *
 * Usage:
 *   node scripts/test-registration-race.js [options]
 *
 * Options:
 *   --url       Strapi base URL (default: http://localhost:1337)
 *   --event     Event documentId (default: uses first event found via API)
 *   --concurrency  Number of concurrent requests (default: 5)
 *   --email     Email to use for test (default: race-test@example.com)
 */

const STRAPI_URL = process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] ?? 'http://localhost:1337';
const CONCURRENCY = parseInt(
  process.argv.find((a) => a.startsWith('--concurrency='))?.split('=')[1] ?? '5',
  10
);
const TEST_EMAIL =
  process.argv.find((a) => a.startsWith('--email='))?.split('=')[1] ?? `race-test-${Date.now()}@example.com`;

async function getFirstEvent() {
  const res = await fetch(`${STRAPI_URL}/api/events?pagination[pageSize]=1`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await res.json();
  return body?.data?.[0]?.documentId ?? body?.data?.[0]?.id ?? null;
}

async function register(eventDocumentId) {
  const res = await fetch(`${STRAPI_URL}/api/registrations/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventDocumentId,
      student: {
        firstName: 'Race',
        lastName: 'Test',
        email: TEST_EMAIL,
        phone: '5550000000',
        tckn: '10000000146',
      },
      kvkkConsent: true,
    }),
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function countRegistrations(eventDocumentId) {
  // Find the student first
  const studentRes = await fetch(
    `${STRAPI_URL}/api/students?filters[email][$eq]=${encodeURIComponent(TEST_EMAIL)}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  const studentBody = await studentRes.json();
  const studentId = studentBody?.data?.[0]?.id;

  if (!studentId) {
    return 0;
  }

  // Query registrations for this student+event via the content API
  const regRes = await fetch(
    `${STRAPI_URL}/api/registrations?filters[student][id][$eq]=${studentId}&filters[event][documentId][$eq]=${eventDocumentId}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  const regBody = await regRes.json();
  return regBody?.data?.length ?? 0;
}

async function main() {
  console.log('=== Registration Race Condition Test ===\n');
  console.log(`Strapi URL:  ${STRAPI_URL}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Test email:  ${TEST_EMAIL}`);
  console.log('');

  const eventDocumentId =
    process.argv.find((a) => a.startsWith('--event='))?.split('=')[1] ?? (await getFirstEvent());

  if (!eventDocumentId) {
    console.error('ERROR: No event found and no --event provided.');
    process.exit(1);
  }

  console.log(`Event ID:    ${eventDocumentId}\n`);

  // Launch concurrent requests
  console.log(`Launching ${CONCURRENCY} concurrent registration requests...`);
  const startTime = Date.now();

  const results = await Promise.all(Array.from({ length: CONCURRENCY }, () => register(eventDocumentId)));

  const elapsed = Date.now() - startTime;
  console.log(`All requests completed in ${elapsed}ms\n`);

  // Analyze results
  const successCount = results.filter((r) => r.status === 200).length;
  const errorCount = results.filter((r) => r.status !== 200).length;

  console.log(`Results:`);
  console.log(`  200 (success): ${successCount}`);
  console.log(`  non-200:       ${errorCount}`);

  if (errorCount > 0) {
    console.log('\n  Non-200 responses:');
    results
      .filter((r) => r.status !== 200)
      .forEach((r, i) => {
        console.log(`    [${i}] status=${r.status} body=${JSON.stringify(r.body)}`);
      });
  }

  // Verify DB state
  const registrationCount = await countRegistrations(eventDocumentId);
  console.log(`\nRegistrations in DB for (${TEST_EMAIL}, ${eventDocumentId}): ${registrationCount}`);

  if (registrationCount === 1) {
    console.log('\n✓ PASS: Exactly 1 registration created (race condition is fixed)');
    process.exit(0);
  } else if (registrationCount === 0) {
    console.log('\n✗ FAIL: No registration created');
    process.exit(1);
  } else {
    console.log(`\n✗ FAIL: ${registrationCount} registrations created (race condition still present)`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

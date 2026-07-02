import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("seed-demo payment fixtures", () => {
  const seedSource = readFileSync(new URL("../../scripts/seed-demo.js", import.meta.url), "utf8");

  it("keeps a future paid CheckoutForm event fixture", () => {
    expect(seedSource).toContain("e2e-test-paid-checkoutform");
    expect(seedSource).toContain("price: 12500");
    expect(seedSource).toContain("startsAt: '2030-01-04T10:00:00.000Z'");
    expect(seedSource).toContain("keepRegistrationsOpen: true");
  });

  it("keeps a paid course CheckoutForm fixture", () => {
    expect(seedSource).toContain("e2e-test-paid-course-checkoutform");
    expect(seedSource).toContain("COURSE_APPLICATION_PAYMENT_AMOUNT_MINOR");
    expect(seedSource).toContain("Course application submission, SPL clear outcome, iyzico CheckoutForm handoff");
  });

  it("persists event price fields for demo and fixture events", () => {
    expect(seedSource).toContain("price: event.price");
    expect(seedSource).toContain("price: fixture.price");
    expect(seedSource).toContain("dailySchedule: fixture.dailySchedule");
  });
});

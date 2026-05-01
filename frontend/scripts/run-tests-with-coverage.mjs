import { describe, after } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.resolve(__dirname, "../src/__tests__");

const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith(".test.mjs"));

let passed = 0;
let failed = 0;

for (const file of testFiles) {
  const filePath = path.join(testsDir, file);
  await describe(path.relative(process.cwd(), filePath), async () => {
    try {
      await import(filePath);
      passed++;
    } catch (err) {
      failed++;
      throw err;
    }
  });
}

after(() => {
  console.log(`\n=== Summary: ${passed} passed, ${failed} failed, ${testFiles.length} total ===`);
});

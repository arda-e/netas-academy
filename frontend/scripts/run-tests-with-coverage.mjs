import { describe, after } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.resolve(__dirname, "../src/__tests__");

function collectTestFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
    } else if (entry.name.endsWith(".test.mjs")) {
      files.push(fullPath);
    }
  }
  return files;
}

const testFiles = collectTestFiles(testsDir);

let passed = 0;
let failed = 0;

for (const filePath of testFiles) {
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

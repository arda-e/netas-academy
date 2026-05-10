import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("KVKK back button uses safe internal returnTo fallback", () => {
  const source = readSource("components/kvkk-back-button.tsx");

  assert.match(
    source,
    /useSearchParams/,
    "back button should read the returnTo query param"
  );
  assert.match(
    source,
    /returnTo\?\.startsWith\("\/"\)\s*&&\s*!returnTo\.startsWith\("\/\/"\)/,
    "back button should only accept internal relative returnTo paths"
  );
  assert.match(
    source,
    /router\.push\(returnTo\)/,
    "back button should use the safe returnTo fallback before plain /iletisim"
  );
});

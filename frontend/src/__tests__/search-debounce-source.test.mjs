import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("search-field uses debounceRef with useRef for setTimeout tracking", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /debounceRef\s*=\s*useRef/,
    "search-field should use useRef for debounce timeout tracking"
  );

  assert.match(
    source,
    /ReturnType<typeof\s+setTimeout>/,
    "debounceRef should be typed with ReturnType<typeof setTimeout>"
  );
});

test("search-field debounces updateSearchParam with 300ms delay", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /setTimeout\s*\(\s*\(\)\s*=>\s*\{\s*\n\s*updateSearchParam/,
    "updateSearchParam should be called inside setTimeout"
  );

  assert.match(
    source,
    /,\s*300\s*\)/,
    "setTimeout should use 300ms delay"
  );
});

test("search-field clears previous timeout before setting new one", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /clearTimeout\s*\(\s*debounceRef\.current\s*\)/,
    "previous timeout should be cleared before setting new one"
  );
});

test("search-field cleans up debounce timeout on unmount", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /return\s*\(\)\s*=>\s*\{\s*\n\s*if\s*\(debounceRef\.current\)/,
    "debounce timeout should be cleaned up on unmount via useEffect return"
  );
});

test("search-field preserves data-testid selectors", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /data-testid="search-field\.toggle"/,
    "search-field.toggle data-testid should be preserved"
  );

  assert.match(
    source,
    /data-testid="search-field\.input"/,
    "search-field.input data-testid should be preserved"
  );
});

test("search-field preserves Turkish accessible labels and placeholders", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /aria-label="Ara"/,
    "Turkish aria-label 'Ara' should be preserved"
  );

  assert.match(
    source,
    /placeholder="Ara\.\.\."/,
    "Turkish placeholder 'Ara...' should be preserved"
  );
});

test("search-field setValue is called immediately on change, not debounced", () => {
  const source = readSource("components/content/search-field.tsx");

  const onChangeBlock = source.match(
    /onChange=\{\(e\) => \{[\s\S]*?\}\}/s
  );

  assert.ok(onChangeBlock, "onChange handler should exist");

  const setValueIndex = onChangeBlock[0].indexOf("setValue");
  const setTimeoutIndex = onChangeBlock[0].indexOf("setTimeout");

  assert.ok(
    setValueIndex < setTimeoutIndex,
    "setValue should be called before setTimeout in onChange handler"
  );
});

test("search-field preserves keyboard focus behavior", () => {
  const source = readSource("components/content/search-field.tsx");

  assert.match(
    source,
    /inputRef\.current\?\.focus/,
    "input focus behavior should be preserved"
  );

  assert.match(
    source,
    /onBlur/,
    "onBlur handler should be preserved for closing search field"
  );
});

/**
 * testids.ts — Selector helper for data-testid instrumentation.
 *
 * Provides utilities for building consistent, predictable test-id selectors
 * across the application. No React dependency — pure functions.
 */

/**
 * Join segments with ".", omitting empty/falsy values.
 *
 * @example
 *   join('a', 'b', 'c')       // → "a.b.c"
 *   join('a', undefined, 'c') // → "a.c"
 *   join('a', '', 'b')        // → "a.b"
 */
export function join(
  ...segments: (string | undefined | null)[]
): string {
  return segments.filter((s) => s != null && s !== "").join(".");
}

/**
 * Normalize a raw string into a safe, lowercase, ASCII test-id key.
 *
 * - Lowercases the input
 * - Replaces spaces and underscores with hyphens
 * - Strips non-ASCII characters (Turkish letters → ASCII fallback)
 * - Collapses consecutive hyphens
 * - Strips leading/trailing hyphens
 *
 * @example
 *   normalizeKey('Veri Analizi')  // → "veri-analizi"
 *   normalizeKey('a--b__c')       // → "a-b-c"
 *   normalizeKey('')              // → ""
 */
export function normalizeKey(raw: string): string {
  const turkishToAscii: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };

  let result = "";
  for (const ch of raw) {
    if (turkishToAscii[ch] !== undefined) {
      result += turkishToAscii[ch];
    } else {
      result += ch;
    }
  }

  return result
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

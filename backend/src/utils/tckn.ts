const normalizeTckn = (value: string) => value.trim().replace(/\s+/g, "");

/**
 * Validates a Turkish Republic ID number using the official checksum rules.
 *
 * The input is normalized by trimming whitespace and removing internal spaces
 * before the 11-digit structure and checksum digits are checked.
 */
export function isValidTckn(value: string) {
  const digits = normalizeTckn(value);

  if (!/^\d{11}$/.test(digits) || digits[0] === "0") {
    return false;
  }

  const numbers = digits.split("").map((digit) => Number(digit));
  const oddIndexSum =
    numbers[0] + numbers[2] + numbers[4] + numbers[6] + numbers[8];
  const evenIndexSum = numbers[1] + numbers[3] + numbers[5] + numbers[7];

  const tenthDigit = (((oddIndexSum * 7 - evenIndexSum) % 10) + 10) % 10;
  const eleventhDigit = numbers.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10;

  return numbers[9] === tenthDigit && numbers[10] === eleventhDigit;
}

/**
 * Normalizes a TCKN string by trimming and removing all whitespace.
 */
export function normalizeTcknValue(value: string) {
  return normalizeTckn(value);
}

/**
 * Masks a TCKN for internal notifications by keeping only the last 4 digits.
 */
export function maskTcknValue(value?: string | null) {
  const normalizedValue = normalizeTckn(value ?? "");

  if (normalizedValue.length < 4) {
    return "****";
  }

  return `${"*".repeat(Math.max(normalizedValue.length - 4, 4))}${normalizedValue.slice(-4)}`;
}

/**
 * One-way hash of a TCKN for pseudonymized storage.
 *
 * Uses SHA-256 with an optional pepper from TCKN_STORAGE_PEPPER.
 * Falls back to a deterministic no-pepper hash if the env var is unset
 * (still significantly better than plaintext, but a pepper is recommended
 * for production deployments subject to KVKK).
 */
export function hashTcknForStorage(value?: string | null) {
  const normalizedValue = normalizeTckn(value ?? "");

  if (!normalizedValue) {
    return null;
  }

  const pepper = process.env.TCKN_STORAGE_PEPPER ?? "";
  const raw = `${pepper}:${normalizedValue}`;

  const hash = require("node:crypto").createHash("sha256");
  hash.update(raw, "utf8");
  return hash.digest("hex");
}

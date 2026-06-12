const TR_LOCALE = "tr-TR";
const TZ = "Europe/Istanbul";

/**
 * Formats a date string for event display: "01 Ocak 2025 14:30"
 */
export function formatEventDateTime(value: string | null | undefined): string {
  if (!value) return "";
  return new Intl.DateTimeFormat(TR_LOCALE, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(value));
}

/**
 * Formats a date string for blog/news display: "1 Ocak 2025" or "01 Ocak 2025"
 * Both day:'numeric' and day:'2-digit' produce the same output for Turkish locale
 * since Turkish uses standard Arabic numerals.
 */
export function formatLongDate(value: string | null | undefined): string {
  if (!value) return "";
  return new Intl.DateTimeFormat(TR_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(value));
}

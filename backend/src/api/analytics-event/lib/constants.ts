export const KNOWN_EVENT_IDS = [
  'lead_tab_view',
  'lead_tab_change',
  'lead_form_start',
  'lead_submit_success',
  'lead_submit_fail',
  'lead_contextual_entry',
  'lead_catalog_click',
  'lead_related_content_click',
] as const;

export const PII_PATTERNS = ['email', 'phone', 'name', 'tckn', 'address', 'password'];

export function containsPII(key: string): boolean {
  const lower = key.toLowerCase();
  return PII_PATTERNS.some((pattern) => lower.includes(pattern));
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const sanitized: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (containsPII(key)) {
        continue;
      }
      sanitized[key] = sanitizeValue(val);
    }

    return sanitized;
  }

  return value;
}

export function sanitizeProperties(properties: Record<string, unknown> | null | undefined): Record<string, unknown> {
  const result = sanitizeValue(properties);
  return (result && typeof result === 'object' && !Array.isArray(result) ? result : {}) as Record<string, unknown>;
}

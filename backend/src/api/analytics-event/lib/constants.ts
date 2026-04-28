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

export function sanitizeProperties(properties: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!properties || typeof properties !== 'object') {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (containsPII(key)) {
      continue;
    }
    sanitized[key] = value;
  }

  return sanitized;
}

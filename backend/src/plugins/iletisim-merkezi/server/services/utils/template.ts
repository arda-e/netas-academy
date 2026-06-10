/**
 * Replace template variables in an HTML string with event data.
 *
 * Supported variables:
 *   {{ event.title }}      — event title
 *   {{ event.startsAt }}   — event start date/time (locale: tr-TR)
 *   {{ event.location }}   — event location
 *   {{ event.meetingLink }} — event meeting link (Zoom etc.)
 *
 * Uses simple String.replaceAll — no template engine needed.
 *
 * @deprecated Use applyTemplateParams instead.
 */
export function replaceTemplateVariables(html: string, event: {
  title: string;
  startsAt: string | Date;
  location?: string | null;
  meetingLink?: string | null;
}): string {
  let result = html;

  result = result.replaceAll('{{ event.title }}', event.title);
  result = result.replaceAll(
    '{{ event.startsAt }}',
    new Date(event.startsAt).toLocaleString('tr-TR', {
      dateStyle: 'full',
      timeStyle: 'short',
    })
  );
  result = result.replaceAll('{{ event.location }}', event.location ?? '');
  result = result.replaceAll('{{ event.meetingLink }}', event.meetingLink ?? '');

  return result;
}

/**
 * Replace named template parameters in an HTML string.
 *
 * Each key in `params` is substituted for all occurrences of `{{ key }}` in
 * the template. Values must already be formatted as display strings.
 *
 * Uses simple String.replaceAll — no template engine needed.
 */
export function applyTemplateParams(html: string, params: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(params)) {
    result = result.replaceAll(`{{ ${key} }}`, value);
  }
  return result;
}

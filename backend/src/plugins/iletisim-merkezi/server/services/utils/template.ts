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

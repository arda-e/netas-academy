/**
 * Replace {{params.<key>}} placeholders in an HTML string with the provided values.
 * Unknown keys are left unreplaced (no error). Matches the {{params.xxx}} convention
 * used in emails/01_registration_confirmation.html and renderer.ts.
 */
export function applyTemplateParams(html: string, params: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(params)) {
    result = result.split(`{{params.${key}}}`).join(value);
  }
  return result;
}

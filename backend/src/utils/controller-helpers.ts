export function formatError(message: string, status = 400): { error: string; status: number } {
  return { error: message, status };
}

export function formatSuccess<T>(data: T): { data: T } {
  return { data };
}

export function validateBody(
  body: Record<string, unknown>,
  requiredFields: string[]
): { error: string; status: number } | null {
  for (const field of requiredFields) {
    const parts = field.split('.');
    let value: unknown = body;
    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return formatError(`${field} is required`);
      }
      value = (value as Record<string, unknown>)[part];
    }
    if (value === null || value === undefined || value === '') {
      return formatError(`${field} is required`);
    }
  }
  return null;
}

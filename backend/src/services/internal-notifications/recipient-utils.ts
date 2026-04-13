const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const coerceCustomRecipientEmails = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

export const normalizeRecipientEmails = (emails: string[]): string[] => {
  const normalized = emails
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0)
    .filter((email) => EMAIL_PATTERN.test(email));

  return [...new Set(normalized)];
};

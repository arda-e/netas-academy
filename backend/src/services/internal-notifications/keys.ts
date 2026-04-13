export const INTERNAL_NOTIFICATION_KEYS = [
  "contact_submission",
  "event_registration",
] as const;

export type InternalNotificationKey = (typeof INTERNAL_NOTIFICATION_KEYS)[number];

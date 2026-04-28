export const INTERNAL_NOTIFICATION_KEYS = [
  "contact_submission",
  "event_registration",
  "course_application_submitted",
  "course_application_manual_review",
  "course_payment_pending",
  "lead_corporate_training",
  "lead_instructor_application",
  "lead_solution_partner",
] as const;

export type InternalNotificationKey = (typeof INTERNAL_NOTIFICATION_KEYS)[number];

import type { InternalNotificationKey } from "./keys";

export interface ContactSubmissionNotificationPayload {
  submissionId: number;
  fullName: string;
  email: string;
  subject: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  submittedAt: string;
}

export interface EventRegistrationNotificationPayload {
  registrationId: number;
  status: string;
  notes?: string | null;
  event: {
    documentId: string;
    title: string;
    slug: string;
    startsAt: string;
    location?: string | null;
  };
  student: {
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    tckn: string;
  };
}

export interface InternalNotificationPayloadMap {
  contact_submission: ContactSubmissionNotificationPayload;
  event_registration: EventRegistrationNotificationPayload;
}

export type InternalNotificationEnvelope<K extends InternalNotificationKey = InternalNotificationKey> = {
  key: K;
  payload: InternalNotificationPayloadMap[K];
};

export interface InternalNotificationEmail {
  subject: string;
  text: string;
}

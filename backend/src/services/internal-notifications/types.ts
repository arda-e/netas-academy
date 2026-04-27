import type { InternalNotificationKey } from "./keys";

export interface ContactSubmissionNotificationPayload {
  submissionId: number;
  fullName: string;
  email: string;
  subject?: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  submittedAt: string;
}

export interface CorporateTrainingLeadPayload {
  submissionId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  submittedAt: string;
  interestTopic?: string | null;
}

export interface InstructorApplicationLeadPayload {
  submissionId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  submittedAt: string;
  expertiseAreas?: string | null;
}

export interface SolutionPartnerLeadPayload {
  submissionId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  submittedAt: string;
  companySize?: string | null;
  partnershipDetails?: string | null;
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

export interface CourseApplicationNotificationPayload {
  applicationId: number;
  applicationNumber: string;
  course: {
    documentId: string;
    title: string;
    slug: string;
  };
  student: {
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    tckn: string;
  };
  status: string;
  nextAction: string;
  paymentUrl?: string | null;
}

export interface InternalNotificationPayloadMap {
  contact_submission: ContactSubmissionNotificationPayload;
  event_registration: EventRegistrationNotificationPayload;
  course_application_submitted: CourseApplicationNotificationPayload;
  course_application_manual_review: CourseApplicationNotificationPayload;
  course_payment_pending: CourseApplicationNotificationPayload;
  lead_corporate_training: CorporateTrainingLeadPayload;
  lead_instructor_application: InstructorApplicationLeadPayload;
  lead_solution_partner: SolutionPartnerLeadPayload;
}

export type InternalNotificationEnvelope<K extends InternalNotificationKey = InternalNotificationKey> = {
  key: K;
  payload: InternalNotificationPayloadMap[K];
};

export interface InternalNotificationEmail {
  subject: string;
  text: string;
}

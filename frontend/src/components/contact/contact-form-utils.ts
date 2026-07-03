import type { LeadType } from "@/lib/lead-intents";

export type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  interestTopic?: string;
  expertiseAreas?: string;
  partnershipDetails?: string;
  kvkkConsent: boolean;
};

export type IntentLeadFormValues = FormValues;

export type FieldErrors = Partial<Record<keyof FormValues, string>> & {
  leadType?: string;
};

export function getSectionErrors(
  errors: FieldErrors,
  leadType: LeadType | null
): Record<string, string | undefined> {
  if (!leadType) {
    return {};
  }

  const result: Record<string, string | undefined> = {};
  const fieldMap: Record<LeadType, Array<keyof FormValues>> = {
    corporate_training_request: ["interestTopic"],
    instructor_application: ["expertiseAreas"],
    solution_partner_application: ["partnershipDetails"],
    general_contact: [],
  };
  for (const field of fieldMap[leadType]) {
    result[field] = errors[field];
  }
  return result;
}

export function normalizeFormValues(values: Partial<FormValues>): FormValues {
  return {
    fullName: values.fullName ?? "",
    email: values.email ?? "",
    phone: values.phone ?? "",
    company: values.company ?? "",
    message: values.message ?? "",
    interestTopic: values.interestTopic ?? "",
    expertiseAreas: values.expertiseAreas ?? "",
    partnershipDetails: values.partnershipDetails ?? "",
    kvkkConsent: values.kvkkConsent ?? false,
  };
}

export function getErrorMessage(payload: unknown, t: (key: string) => string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    const message = payload.error.message;
    if (
      message ===
      "leadType is required and must be one of: corporate_training_request, instructor_application, solution_partner_application, general_contact"
    ) {
      return t("error.invalid_lead_type");
    }
    if (message === "fullName, email, phone, and message are required") {
      return t("error.required_fields");
    }
    if (message === "phone has invalid format") {
      return t("validation.phone_invalid");
    }
    if (message === "kvkkConsent must be true") {
      return t("error.kvkk_consent");
    }
    if (message === "turnstileToken is required") {
      return t("error.human_check_required");
    }
    if (message === "turnstile verification failed") {
      return t("error.human_check_failed");
    }
    return message;
  }
  return t("error.submit_failed");
}

import { z } from "zod";

export const LEAD_TYPES = [
  "corporate_training_request",
  "instructor_application",
  "solution_partner_application",
  "general_contact",
] as const;

export type LeadType = (typeof LEAD_TYPES)[number];

/* ─── Translation function type ─── */

type TFunc = (key: string) => string;

/* ─── Zod schemas per lead type (factored to accept t for dynamic locale) ─── */

export function getIntentSchemas(t: TFunc): Record<LeadType, z.ZodType> {
  const baseSchema = z.object({
      fullName: z.string().min(1, t("validation.full_name_required")),
      email: z.string().email(t("validation.email_invalid")),
      phone: z.string().min(1, t("validation.phone_required")),
      company: z.string().optional(),
      message: z.string().min(1, t("validation.message_required")),
      kvkkConsent: z.boolean().refine((val) => val === true, {
        message: t("validation.kvkk_required"),
      }),
  });

  return {
    corporate_training_request: baseSchema.extend({
        interestTopic: z.string().min(1, t("validation.interest_topic_required")),
    }),
    instructor_application: baseSchema.extend({
        expertiseAreas: z.string().min(1, t("validation.expertise_areas_required")),
    }),
    solution_partner_application: baseSchema.extend({
        companySize: z.string().min(1, t("validation.company_size_required")),
    }),
    general_contact: baseSchema,
  };
}

export function getSchemaForLeadType(
  t: TFunc,
  leadType: LeadType
): z.ZodType {
  return getIntentSchemas(t)[leadType];
}

/* ─── Lead intent metadata (factored to accept t for dynamic locale) ─── */

export function getLeadIntents(
  t: TFunc
): Record<
  LeadType,
  {
    label: string;
    description: string;
    successMessage: string;
    successCtaLabel?: string;
    successCtaHref?: string;
  }
> {
  return {
    corporate_training_request: {
      label: t("tab.corporate"),
      description:
        "Ekibiniz için özelleştirilmiş eğitim programları talep edin.",
      successMessage: t("success.corporate"),
      successCtaLabel: t("success.corporate_cta"),
      successCtaHref: "/katalog",
    },
    instructor_application: {
      label: t("tab.instructor"),
      description: "Uzmanlık alanınızda eğitmen olarak başvurun.",
      successMessage: t("success.instructor"),
    },
    solution_partner_application: {
      label: t("tab.partner"),
      description: "Çözüm ortaklığı için başvurun.",
      successMessage: t("success.partner"),
    },
    general_contact: {
      label: t("tab.general"),
      description: "Bize genel bir mesaj gönderin.",
      successMessage: t("success.general"),
    },
  };
}

export function buildIntentLeadUrl(
  intent: LeadType,
  options?: { topic?: string }
): string {
  const params = new URLSearchParams();
  params.set("intent", intent);
  if (options?.topic) {
    params.set("topic", options.topic);
  }
  return `/iletisim?${params.toString()}`;
}

export function resolveLeadTypeFromQuery(
  intent: string | null
): LeadType | null {
  if (
    intent &&
    LEAD_TYPES.includes(intent as LeadType)
  ) {
    return intent as LeadType;
  }
  return null;
}

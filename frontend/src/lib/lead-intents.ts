import { z } from "zod";

export const LEAD_TYPES = [
  "corporate_training_request",
  "instructor_application",
  "solution_partner_application",
  "general_contact",
] as const;

export type LeadType = (typeof LEAD_TYPES)[number];

/* ─── Zod schemas per lead type ─── */

const baseSchema = z.object({
  fullName: z.string().min(1, "Ad Soyad zorunludur"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z.string().min(1, "Telefon numarası zorunludur"),
  company: z.string().optional(),
  message: z.string().min(1, "Mesaj alanı zorunludur"),
});

export const intentSchemas: Record<LeadType, z.ZodType> = {
  corporate_training_request: baseSchema.extend({
    interestTopic: z.string().min(1, "İlgi duyulan eğitim/konu zorunludur"),
  }),
  instructor_application: baseSchema.extend({
    expertiseAreas: z.string().min(1, "Uzmanlık alanlarınız zorunludur"),
  }),
  solution_partner_application: baseSchema.extend({
    companySize: z.string().min(1, "Şirket büyüklüğü zorunludur"),
  }),
  general_contact: baseSchema,
};

export function getSchemaForLeadType(leadType: LeadType): z.ZodType {
  return intentSchemas[leadType];
}

export const LEAD_INTENTS: Record<
  LeadType,
  {
    label: string;
    description: string;
    successMessage: string;
    successCtaLabel?: string;
    successCtaHref?: string;
  }
> = {
  corporate_training_request: {
    label: "Kurumsal Eğitim Talebi",
    description:
      "Ekibiniz için özelleştirilmiş eğitim programları talep edin.",
    successMessage:
      "Kurumsal eğitim talebiniz alınmıştır. Eğitim kataloğumuza göz atabilir veya ekibinizle iletişime geçeceğiz.",
    successCtaLabel: "Eğitim Kataloğunu İncele",
    successCtaHref: "/katalog",
  },
  instructor_application: {
    label: "Eğitmen Başvurusu",
    description: "Uzmanlık alanınızda eğitmen olarak başvurun.",
    successMessage:
      "Eğitmen başvurunuz alınmıştır. Uzmanlık alanınıza uygun fırsatlar için sizinle iletişime geçeceğiz.",
  },
  solution_partner_application: {
    label: "Çözüm Ortağı Başvurusu",
    description: "Çözüm ortaklığı için başvurun.",
    successMessage:
      "Çözüm ortaklığı başvurunuz alınmıştır. İş geliştirme ekibimiz sizinle iletişime geçecektir.",
  },
  general_contact: {
    label: "Genel İletişim",
    description: "Bize genel bir mesaj gönderin.",
    successMessage:
      "Mesajınız alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.",
  },
};

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

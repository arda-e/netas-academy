"use client";

import type { LeadType } from "@/lib/lead-intents";
import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { IntentLeadFormValues } from "./intent-lead-form";

const fieldClassName =
  "h-11 rounded-sm border-border/80 bg-card/68 px-4 text-base focus-visible:border-ring md:h-12 md:px-5 md:text-base";

const labelClassName = "text-md font-medium text-foreground";

const fieldWrapperClassName = "space-y-2 md:space-y-3";

type IntentFieldSectionsProps = {
  leadType: LeadType;
  register: UseFormRegister<IntentLeadFormValues>;
  errors: Record<string, string | undefined>;
};

export function IntentFieldSections({ leadType, register, errors }: IntentFieldSectionsProps) {
  switch (leadType) {
    case "corporate_training_request":
      return (
        <div className={fieldWrapperClassName}>
          <label htmlFor="interestTopic" className={labelClassName}>
            İlgi Duyulan Eğitim / Konu*
          </label>
          <Input
            id="interestTopic"
            placeholder="Örn. Veri Bilimi, Liderlik, Siber Güvenlik"
            className={fieldClassName}
            {...register("interestTopic")}
            data-testid="contact-lead.field.interest-topic"
          />
          {errors.interestTopic && (
            <p className="text-sm text-destructive">{errors.interestTopic}</p>
          )}
        </div>
      );

    case "instructor_application":
      return (
        <div className={fieldWrapperClassName}>
          <label htmlFor="expertiseAreas" className={labelClassName}>
            Uzmanlık Alanlarınız*
          </label>
          <Textarea
            id="expertiseAreas"
            placeholder="Örn. Python, Makine Öğrenmesi, Derin Öğrenme"
            className="min-h-[7rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:min-h-[9rem] md:px-5 md:text-base"
            {...register("expertiseAreas")}
            data-testid="contact-lead.field.expertise-areas"
          />
          {errors.expertiseAreas && (
            <p className="text-sm text-destructive">{errors.expertiseAreas}</p>
          )}
        </div>
      );

    case "solution_partner_application":
      return (
        <>
          <div className={fieldWrapperClassName}>
            <label htmlFor="companySize" className={labelClassName}>
              Şirket Büyüklüğü*
            </label>
            <Input
              id="companySize"
              placeholder="Örn. 10-50, 50-100, 100+"
              className={fieldClassName}
              {...register("companySize")}
              data-testid="contact-lead.field.company-size"
            />
            {errors.companySize && (
              <p className="text-sm text-destructive">{errors.companySize}</p>
            )}
          </div>
          <div className={fieldWrapperClassName}>
            <label htmlFor="partnershipDetails" className={labelClassName}>
              Ortaklık Detayları
            </label>
            <Textarea
              id="partnershipDetails"
              placeholder="Ortaklık motivasyonunuzu ve beklentilerinizi kısaca paylaşın."
              className="min-h-[7rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:min-h-[9rem] md:px-5 md:text-base"
              {...register("partnershipDetails")}
              data-testid="contact-lead.field.partnership-details"
            />
          </div>
        </>
      );

    case "general_contact":
    default:
      return null;
  }
}

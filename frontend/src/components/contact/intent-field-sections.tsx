"use client";

import { useTranslations } from "next-intl";
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
  onFieldFocus?: () => void;
};

export function IntentFieldSections({ leadType, register, errors, onFieldFocus }: IntentFieldSectionsProps) {
  const t = useTranslations("contact");
  switch (leadType) {
    case "corporate_training_request":
      return (
        <div className={fieldWrapperClassName}>
          <label htmlFor="interestTopic" className={labelClassName}>
            {t("contact.field.interest_topic.label")}
          </label>
          <Input
            id="interestTopic"
            placeholder={t("contact.field.interest_topic.placeholder")}
            className={fieldClassName}
            {...register("interestTopic")}
            onFocus={onFieldFocus}
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
            {t("contact.field.expertise_areas.label")}
          </label>
          <Textarea
            id="expertiseAreas"
            placeholder={t("contact.field.expertise_areas.placeholder")}
            className="min-h-[7rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:min-h-[9rem] md:px-5 md:text-base"
            {...register("expertiseAreas")}
            onFocus={onFieldFocus}
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
              {t("contact.field.company_size.label")}
            </label>
            <Input
              id="companySize"
              placeholder={t("contact.field.company_size.placeholder")}
              className={fieldClassName}
              {...register("companySize")}
              onFocus={onFieldFocus}
              data-testid="contact-lead.field.company-size"
            />
            {errors.companySize && (
              <p className="text-sm text-destructive">{errors.companySize}</p>
            )}
          </div>
          <div className={fieldWrapperClassName}>
            <label htmlFor="partnershipDetails" className={labelClassName}>
              {t("contact.field.partnership_details.label")}
            </label>
            <Textarea
              id="partnershipDetails"
              placeholder={t("contact.field.partnership_details.placeholder")}
              className="min-h-[7rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:min-h-[9rem] md:px-5 md:text-base"
              {...register("partnershipDetails")}
              onFocus={onFieldFocus}
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

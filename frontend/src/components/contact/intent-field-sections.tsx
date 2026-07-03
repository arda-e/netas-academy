"use client";

import { useTranslations } from "next-intl";
import type { LeadType } from "@/lib/lead-intents";
import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { IntentLeadFormValues } from "./contact-form-utils";

const fieldClassName =
  "h-11 rounded-lg border-transparent bg-white px-3 py-2 text-base text-foreground shadow-xs ring-1 ring-border/80 ring-inset transition-shadow duration-100 ease-linear placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/80 md:h-12 md:px-3 md:text-base";

const labelClassName = "flex cursor-default items-center gap-0.5 text-sm font-medium text-muted-foreground";

const fieldWrapperClassName = "space-y-2 md:space-y-3";

type IntentFieldSectionsProps = {
  leadType: LeadType | null;
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
            {t("field.interest_topic.label")}
          </label>
          <Input
            id="interestTopic"
            placeholder={t("field.interest_topic.placeholder")}
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
            {t("field.expertise_areas.label")}
          </label>
          <Textarea
            id="expertiseAreas"
            placeholder={t("field.expertise_areas.placeholder")}
            className="min-h-[7rem] rounded-lg border-transparent bg-white px-3 py-2 text-base text-foreground shadow-xs ring-1 ring-border/80 ring-inset transition-shadow duration-100 ease-linear placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/80 md:min-h-[9rem] md:text-base"
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
            <label htmlFor="partnershipDetails" className={labelClassName}>
              {t("field.partnership_details.label")}
            </label>
            <Textarea
              id="partnershipDetails"
              placeholder={t("field.partnership_details.placeholder")}
              className="min-h-[7rem] rounded-lg border-transparent bg-white px-3 py-2 text-base text-foreground shadow-xs ring-1 ring-border/80 ring-inset transition-shadow duration-100 ease-linear placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/80 md:min-h-[9rem] md:text-base"
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

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LeadType } from "@/lib/lead-intents";
import { LEAD_TYPES } from "@/lib/lead-intents";
import { ChevronDown } from "lucide-react";
import { join } from "@/lib/testids";
import { useIntentLeadForm } from "./use-intent-lead-form";
import { LeadFormSuccess } from "./lead-form-success";
import { getSectionErrors } from "./contact-form-utils";
import { IntentFieldSections } from "./intent-field-sections";

export type { IntentLeadFormValues } from "./contact-form-utils";

const fieldClassName =
  "h-11 rounded-sm border-border/80 bg-card/68 px-4 text-base focus-visible:border-ring md:h-12 md:px-5 md:text-base";

const selectClassName =
  "h-11 w-full min-w-0 rounded-sm border-3 border-border/80 bg-card/68 px-4 text-base appearance-none cursor-pointer pr-10 outline-none focus-visible:border-ring md:h-12 md:px-5 md:text-base";

const labelClassName = "text-md font-medium text-foreground";

const fieldWrapperClassName = "space-y-2 md:space-y-3";

type IntentLeadFormProps = {
  initialLeadType: LeadType;
  prefilledTopic?: string;
};

export function IntentLeadForm({ initialLeadType, prefilledTopic }: IntentLeadFormProps) {
  const t = useTranslations("contact");
  const {
    leadType,
    leadIntents,
    success,
    errorMessage,
    fieldErrors,
    isPending,
    kvkkReturnTo,
    formKey,
    register,
    handleIntentChange,
    handleFieldInteraction,
    handleFormSubmit,
    handleNewSubmission,
    persistCurrentValues,
  } = useIntentLeadForm({ initialLeadType, prefilledTopic });

  if (success) {
    return <LeadFormSuccess leadType={leadType} onNewSubmission={handleNewSubmission} />;
  }

  return (
    <form key={formKey} className="space-y-6 md:space-y-8" onSubmit={handleFormSubmit} data-testid="contact-lead.form">
      {errorMessage && (
        <div
          className="rounded-sm border border-destructive/40 bg-destructive/10 px-5 py-4 text-base text-destructive"
          data-testid="contact-lead.error"
        >
          {errorMessage}
        </div>
      )}

      {/* Common fields */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <label htmlFor="fullName" className={labelClassName}>
            {t("field.full_name.label")}
          </label>
          <Input
            id="fullName"
            className={fieldClassName}
            {...register("fullName")}
            onFocus={handleFieldInteraction}
            data-testid="contact-lead.field.full-name"
          />
          {fieldErrors.fullName ? (
            <p className="text-sm text-destructive" data-testid={join("contact-lead", "error", "fullName")}>
              {fieldErrors.fullName}
            </p>
          ) : null}
        </div>

        {/* Intent selector — second field in the grid, after Ad Soyad */}
        <div className={fieldWrapperClassName}>
          <label htmlFor="intentSelect" className={labelClassName}>
            {t("field.request_type.label")}
          </label>
          <div className="relative">
            <select
              id="intentSelect"
              value={leadType}
              data-testid="contact-lead.intent-select"
              onChange={handleIntentChange}
              className={selectClassName}
            >
              {LEAD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {leadIntents[type].label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="email" className={labelClassName}>
            {t("field.email.label")}
          </label>
          <Input
            id="email"
            type="email"
            className={fieldClassName}
            {...register("email")}
            onFocus={handleFieldInteraction}
            data-testid="contact-lead.field.email"
          />
          {fieldErrors.email ? (
            <p className="text-sm text-destructive" data-testid={join("contact-lead", "error", "email")}>
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="phone" className={labelClassName}>
            {t("field.phone.label")}
          </label>
          <Input
            id="phone"
            type="tel"
            className={fieldClassName}
            {...register("phone")}
            onFocus={handleFieldInteraction}
            data-testid="contact-lead.field.phone"
          />
          {fieldErrors.phone ? (
            <p className="text-sm text-destructive" data-testid={join("contact-lead", "error", "phone")}>
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="company" className={labelClassName}>
            {t("field.company.label")}
          </label>
          <Input
            id="company"
            className={fieldClassName}
            {...register("company")}
            onFocus={handleFieldInteraction}
            data-testid="contact-lead.field.company"
          />
        </div>
      </div>

      {/* Intent-specific fields */}
      <IntentFieldSections
        leadType={leadType}
        register={register}
        errors={getSectionErrors(fieldErrors, leadType)}
        onFieldFocus={handleFieldInteraction}
      />

      {/* Message */}
      <div className={fieldWrapperClassName}>
        <label htmlFor="message" className={labelClassName}>
          {t("field.message.label")}
        </label>
        <Textarea
          id="message"
          className="min-h-[10rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:min-h-[12rem] md:px-5 md:text-base"
          {...register("message")}
          onFocus={handleFieldInteraction}
          data-testid="contact-lead.field.message"
        />
        {fieldErrors.message ? (
          <p className="text-sm text-destructive" data-testid={join("contact-lead", "error", "message")}>
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/* KVKK Consent Checkbox + Notice */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <input
            id="kvkkConsent"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border/80 accent-primary"
            {...register("kvkkConsent")}
            onFocus={handleFieldInteraction}
            data-testid="contact-lead.field.kvkk-consent"
          />
          <label htmlFor="kvkkConsent" className="cursor-pointer text-sm leading-6 text-muted-foreground">
            {t("kvkk.text")}{" "}
            <Link
              href={`/kvkk?returnTo=${encodeURIComponent(kvkkReturnTo)}`}
              onClick={persistCurrentValues}
              className="text-primary transition-colors hover:text-primary/80"
              data-testid="contact-lead.link.kvkk-disclosure"
            >
              {t("kvkk.link")}
            </Link>
            {t("kvkk.suffix")}
          </label>
        </div>
        {fieldErrors.kvkkConsent ? (
          <p className="pl-7 text-sm text-destructive">{fieldErrors.kvkkConsent}</p>
        ) : null}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-4 sm:items-start md:flex-row md:items-end md:justify-between">
        <div className="flex-1" />
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-md px-7 text-base font-semibold hover:cursor-pointer sm:w-auto md:text-lg"
          data-testid="contact-lead.submit"
        >
          {isPending ? t("submit.pending") : t("submit.idle")}
        </Button>
      </div>
    </form>
  );
}

"use client";

import Script from "next/script";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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
  "h-11 rounded-lg border-transparent bg-white px-3 py-2 text-base text-foreground shadow-xs ring-1 ring-border/80 ring-inset transition-shadow duration-100 ease-linear placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/80 md:h-12 md:px-3 md:text-base";

const selectClassName =
  "h-11 w-full min-w-0 appearance-none rounded-lg border border-transparent bg-white px-3 py-2 pr-10 text-base text-foreground shadow-xs ring-1 ring-border/80 ring-inset transition-shadow duration-100 ease-linear outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/80 md:h-12 md:text-base";

const labelClassName = "flex cursor-default items-center gap-0.5 text-sm font-medium text-muted-foreground";

const fieldWrapperClassName = "space-y-2 md:space-y-3";

const turnstileSiteKey =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
    : undefined;

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme: "light";
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type IntentLeadFormProps = {
  initialLeadType: LeadType;
  prefilledTopic?: string;
};

type TurnstileHumanCheckProps = {
  resetKey: number;
  onVerify: (token: string) => void;
  onExpire: () => void;
};

function TurnstileHumanCheck({ resetKey, onVerify, onExpire }: TurnstileHumanCheckProps) {
  const t = useTranslations("contact");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  useEffect(() => {
    if (!turnstileSiteKey || !isScriptReady || !containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: turnstileSiteKey,
      callback: onVerify,
      "expired-callback": onExpire,
      "error-callback": onExpire,
      theme: "light",
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [isScriptReady, onExpire, onVerify]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  if (!turnstileSiteKey) {
    return null;
  }

  return (
    <div className="space-y-2" data-testid="contact-lead.human-check">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setIsScriptReady(true)}
      />
      <div ref={containerRef} className="min-h-[65px]" />
      <p className="text-xs leading-5 text-muted-foreground">{t("human_check.notice")}</p>
    </div>
  );
}

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
    turnstileResetKey,
    register,
    handleIntentChange,
    handleFieldInteraction,
    handleFormSubmit,
    handleNewSubmission,
    persistCurrentValues,
    handleTurnstileVerify,
    handleTurnstileExpire,
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
          className="min-h-[10rem] rounded-lg border-transparent bg-white px-3 py-2 text-base text-foreground shadow-xs ring-1 ring-border/80 ring-inset transition-shadow duration-100 ease-linear placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/80 md:min-h-[12rem] md:text-base"
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
            <span className="block">{t("kvkk.text")}</span>
            <span className="block">
              <Link
                href={`/kvkk?returnTo=${encodeURIComponent(kvkkReturnTo)}`}
                onClick={persistCurrentValues}
                className="text-primary transition-colors hover:text-primary/80"
                data-testid="contact-lead.link.kvkk-disclosure"
              >
                {t("kvkk.link")}
              </Link>
              {t("kvkk.suffix")}
            </span>
          </label>
        </div>
        {fieldErrors.kvkkConsent ? (
          <p className="pl-7 text-sm text-destructive">{fieldErrors.kvkkConsent}</p>
        ) : null}
      </div>

      <TurnstileHumanCheck
        resetKey={turnstileResetKey}
        onVerify={handleTurnstileVerify}
        onExpire={handleTurnstileExpire}
      />

      {/* Submit Button */}
      <div className="flex flex-col gap-4 sm:items-start md:flex-row md:items-end md:justify-between">
        <div className="flex-1" />
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full rounded-md px-5 text-sm font-semibold hover:cursor-pointer sm:w-auto md:text-base"
          data-testid="contact-lead.submit"
        >
          {isPending ? t("submit.pending") : t("submit.idle")}
        </Button>
      </div>
    </form>
  );
}

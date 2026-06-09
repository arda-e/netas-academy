"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useForm } from "react-hook-form";

import type { LeadType } from "@/lib/lead-intents";
import {
  getLeadIntents,
  LEAD_TYPES,
  buildIntentLeadUrl,
  getSchemaForLeadType,
} from "@/lib/lead-intents";
import { FormStorage } from "@/lib/form-storage";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import {
  emitLeadCatalogClick,
  emitLeadContextualEntry,
  emitLeadFormStart,
  emitLeadRelatedContentClick,
  emitLeadSubmitFail,
  emitLeadSubmitSuccess,
  emitLeadTabChange,
  emitLeadTabView,
} from "@/lib/analytics-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { IntentFieldSections } from "./intent-field-sections";
import { join } from "@/lib/testids";

const fieldClassName =
  "h-11 rounded-sm border-border/80 bg-card/68 px-4 text-base focus-visible:border-ring md:h-12 md:px-5 md:text-base";

const labelClassName = "text-md font-medium text-foreground";

const fieldWrapperClassName = "space-y-2 md:space-y-3";

/* ─── Types ─── */

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  interestTopic?: string;
  expertiseAreas?: string;
  companySize?: string;
  partnershipDetails?: string;
  kvkkConsent: boolean;
};

export type IntentLeadFormValues = FormValues;

type IntentLeadFormProps = {
  initialLeadType: LeadType;
  prefilledTopic?: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

export function IntentLeadForm({ initialLeadType, prefilledTopic }: IntentLeadFormProps) {
  const t = useTranslations("contact");
  const leadIntents = getLeadIntents(t);
  const [leadType, setLeadType] = useState<LeadType>(initialLeadType);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();
  const hasEmittedStartRef = useRef(false);
  const previousLeadTypeRef = useRef<LeadType>(leadType);

  const { save: persistValues, clear: clearStorage } =
    useFormPersistence<FormValues>(`contact-form-${leadType}`, {
      sensitiveFields: [],
    });

  // lead_tab_view: emit on mount and when leadType changes
  useEffect(() => {
    emitLeadTabView(leadType);
  }, [leadType]);

  // lead_contextual_entry: emit once when arriving with a pre-selected intent
  useEffect(() => {
    if (initialLeadType !== "general_contact") {
      emitLeadContextualEntry(initialLeadType);
    }
  }, [initialLeadType]);

  // lead_form_start: emit on first field interaction per visit
  const handleFieldInteraction = useCallback(() => {
    if (!hasEmittedStartRef.current) {
      hasEmittedStartRef.current = true;
      emitLeadFormStart(leadType);
    }
  }, [leadType]);

  const schema = getSchemaForLeadType(t, leadType);
  const {
    register,
    getValues,
    reset,
    watch,
  } = useForm<FormValues>({
    shouldUnregister: true,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      interestTopic: prefilledTopic || "",
      expertiseAreas: "",
      companySize: "",
      partnershipDetails: "",
      kvkkConsent: false,
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Restore form values from sessionStorage on mount
  // Uses a direct FormStorage call with initialLeadType to avoid hook complication
  // when leadType may have already changed on re-render.
  useEffect(() => {
    const saved = new FormStorage(`contact-form-${initialLeadType}`).load<FormValues>();
    if (saved) {
      reset({
        fullName: saved.fullName ?? "",
        email: saved.email ?? "",
        phone: saved.phone ?? "",
        company: saved.company ?? "",
        message: saved.message ?? "",
        interestTopic: saved.interestTopic ?? prefilledTopic ?? "",
        expertiseAreas: saved.expertiseAreas ?? "",
        companySize: saved.companySize ?? "",
        partnershipDetails: saved.partnershipDetails ?? "",
        kvkkConsent: saved.kvkkConsent ?? false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset form only when switching tabs. Route back/forward can remount or
  // replay effects without a real lead type change, so do not key this to mount.
  useEffect(() => {
    if (previousLeadTypeRef.current === leadType) {
      return;
    }
    const previousLeadType = previousLeadTypeRef.current;
    previousLeadTypeRef.current = leadType;

    reset({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      interestTopic: prefilledTopic || "",
      expertiseAreas: "",
      companySize: "",
      partnershipDetails: "",
      kvkkConsent: false,
    });
    hasEmittedStartRef.current = false;
    new FormStorage(`contact-form-${previousLeadType}`).clear();
  }, [leadType, reset, prefilledTopic]);

  const kvkkReturnTo = buildIntentLeadUrl(
    leadType,
    prefilledTopic ? { topic: prefilledTopic } : undefined
  );

  // Persist only after real form changes so the first render cannot overwrite
  // restored sessionStorage values with empty defaults.
  useEffect(() => {
    const subscription = watch((values) => {
      persistValues(normalizeFormValues(values as Partial<FormValues>));
    });

    return () => subscription.unsubscribe();
  }, [watch, persistValues]);

  const persistCurrentValues = useCallback(() => {
    persistValues(getValues());
  }, [getValues, persistValues]);

  const onSubmit = useCallback(
    (data: FormValues) => {
      setErrorMessage(null);
      hasEmittedStartRef.current = true;

      const payload = {
        leadType,
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company?.trim() || undefined,
        message: data.message.trim(),
        interestTopic: data.interestTopic?.trim() || undefined,
        expertiseAreas: data.expertiseAreas?.trim() || undefined,
        companySize: data.companySize?.trim() || undefined,
        partnershipDetails: data.partnershipDetails?.trim() || undefined,
        kvkkConsent: data.kvkkConsent,
      };

      startTransition(async () => {
        try {
          const response = await fetch("/api/contact-submissions/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const result = (await response.json().catch(() => null)) as unknown;

          if (!response.ok) {
            const reason = getErrorMessage(result, t);
            setErrorMessage(reason);
            emitLeadSubmitFail(leadType, reason);
            return;
          }

          setSuccess(true);
          emitLeadSubmitSuccess(leadType);
          clearStorage();
          reset();
        } catch {
          const reason = t("error.submit_failed");
          setErrorMessage(reason);
          emitLeadSubmitFail(leadType, reason);
        }
      });
    },
    [leadType, reset, clearStorage, t]
  );

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const values = getValues();
      const parsed = schema.safeParse(values);

      if (!parsed.success) {
        const nextFieldErrors: FieldErrors = {};

        for (const issue of parsed.error.issues) {
          const fieldName = issue.path[0];
          if (typeof fieldName === "string" && fieldName in values) {
            nextFieldErrors[fieldName as keyof FormValues] = issue.message;
          }
        }

        setFieldErrors(nextFieldErrors);
        setErrorMessage(null);
        return;
      }

      setFieldErrors({});
      onSubmit(parsed.data as FormValues);
    },
    [getValues, onSubmit, schema]
  );

  if (success) {
    const intent = leadIntents[leadType];
    return (
      <div className="space-y-6" data-testid="contact-lead.success">
        <div className="rounded-sm border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-base text-emerald-100">
          {intent.successMessage}
        </div>
        {intent.successCtaHref && intent.successCtaLabel ? (
          <Link
            href={intent.successCtaHref}
            className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80"
            onClick={() => emitLeadCatalogClick(leadType)}
            data-testid="contact-lead.success-cta"
          >
            {intent.successCtaLabel}
          </Link>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            emitLeadRelatedContentClick(leadType);
            hasEmittedStartRef.current = false;
            clearStorage();
            setSuccess(false);
          }}
          className="h-12 rounded-md px-7 text-base font-semibold sm:w-auto md:text-lg"
          data-testid="contact-lead.new-submission"
        >
          {t("new_submission")}
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-6 md:space-y-8" onSubmit={handleFormSubmit} data-testid="contact-lead.form">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/8 pb-3" data-testid="contact-lead.tabs">
        {LEAD_TYPES.map((type) => {
          const isActive = type === leadType;
          return (
            <button
              key={type}
              type="button"
              data-testid={join("contact-lead", "tab", type)}
              onClick={() => {
                if (type !== leadType) {
                  emitLeadTabChange(leadType, type);
                  setSuccess(false);
                  setErrorMessage(null);
                  setFieldErrors({});
                  setLeadType(type);
                }
              }}
              className={`rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/60 hover:text-foreground/80"
              }`}
            >
              {leadIntents[type].label}
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-5 py-4 text-base text-destructive" data-testid="contact-lead.error">
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
            <p className="text-sm text-destructive" data-testid={join("contact-lead", "error", "fullName")}>{fieldErrors.fullName}</p>
          ) : null}
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
          {fieldErrors.email ? <p className="text-sm text-destructive" data-testid={join("contact-lead", "error", "email")}>{fieldErrors.email}</p> : null}
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
          {fieldErrors.phone ? <p className="text-sm text-destructive" data-testid={join("contact-lead", "error", "phone")}>{fieldErrors.phone}</p> : null}
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
        {fieldErrors.message ? <p className="text-sm text-destructive" data-testid={join("contact-lead", "error", "message")}>{fieldErrors.message}</p> : null}
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

        <Button type="submit" disabled={isPending} className="h-12 w-full rounded-md px-7 text-base font-semibold sm:w-auto md:text-lg" data-testid="contact-lead.submit">
          {isPending ? t("submit.pending") : t("submit.idle")}
        </Button>
      </div>
    </form>
  );
}

function getSectionErrors(
  errors: Partial<Record<keyof FormValues, string>>,
  leadType: LeadType
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  const fieldMap: Record<LeadType, Array<keyof FormValues>> = {
    corporate_training_request: ["interestTopic"],
    instructor_application: ["expertiseAreas"],
    solution_partner_application: ["companySize", "partnershipDetails"],
    general_contact: [],
  };
  for (const field of fieldMap[leadType]) {
    result[field] = errors[field];
  }
  return result;
}

function normalizeFormValues(values: Partial<FormValues>): FormValues {
  return {
    fullName: values.fullName ?? "",
    email: values.email ?? "",
    phone: values.phone ?? "",
    company: values.company ?? "",
    message: values.message ?? "",
    interestTopic: values.interestTopic ?? "",
    expertiseAreas: values.expertiseAreas ?? "",
    companySize: values.companySize ?? "",
    partnershipDetails: values.partnershipDetails ?? "",
    kvkkConsent: values.kvkkConsent ?? false,
  };
}

function getErrorMessage(payload: unknown, t: (key: string) => string): string {
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
    if (
      message ===
      "fullName, email, phone, and message are required"
    ) {
      return t("error.required_fields");
    }
    if (message === "kvkkConsent must be true") {
      return t("error.kvkk_consent");
    }
    return message;
  }
  return t("error.submit_failed");
}

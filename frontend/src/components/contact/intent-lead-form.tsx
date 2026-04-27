"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { LeadType } from "@/lib/lead-intents";
import { LEAD_INTENTS, LEAD_TYPES, getSchemaForLeadType } from "@/lib/lead-intents";
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
import { IntentFieldSections } from "./intent-field-sections";

const fieldClassName =
  "h-12 rounded-sm border-border/80 bg-card/68 px-4 text-base focus-visible:border-ring md:h-14 md:px-5 md:text-base";

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

type IntentLeadFormProps = {
  initialLeadType: LeadType;
  prefilledTopic?: string;
};

export function IntentLeadForm({ initialLeadType, prefilledTopic }: IntentLeadFormProps) {
  const [leadType, setLeadType] = useState<LeadType>(initialLeadType);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasEmittedStartRef = useRef(false);

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

  const schema = getSchemaForLeadType(leadType);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
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
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Re-validate on tab change
  useEffect(() => {
    trigger();
  }, [leadType, trigger]);

  // Reset form when switching tabs
  useEffect(() => {
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
    setSuccess(false);
    setErrorMessage(null);
    hasEmittedStartRef.current = false;
  }, [leadType, reset, prefilledTopic]);

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
            const reason = getErrorMessage(result);
            setErrorMessage(reason);
            emitLeadSubmitFail(leadType, reason);
            return;
          }

          setSuccess(true);
          emitLeadSubmitSuccess(leadType);
          reset();
        } catch {
          const reason = "Form gönderilemedi. Lütfen tekrar deneyin.";
          setErrorMessage(reason);
          emitLeadSubmitFail(leadType, reason);
        }
      });
    },
    [leadType, reset]
  );

  if (success) {
    const intent = LEAD_INTENTS[leadType];
    return (
      <div className="space-y-6">
        <div className="rounded-sm border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-base text-emerald-100">
          {intent.successMessage}
        </div>
        {intent.successCtaHref && intent.successCtaLabel ? (
          <Link
            href={intent.successCtaHref}
            className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80"
            onClick={() => emitLeadCatalogClick(leadType)}
          >
            {intent.successCtaLabel}
          </Link>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            emitLeadRelatedContentClick(leadType);
            setSuccess(false);
          }}
          className="h-12 rounded-md px-7 text-base font-semibold sm:w-auto md:text-lg"
        >
          Yeni Başvuru Yap
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit(onSubmit)}>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/8 pb-3">
        {LEAD_TYPES.map((type) => {
          const isActive = type === leadType;
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                if (type !== leadType) {
                  emitLeadTabChange(leadType, type);
                  setLeadType(type);
                }
              }}
              className={`rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/60 hover:text-foreground/80"
              }`}
            >
              {LEAD_INTENTS[type].label}
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-5 py-4 text-base text-destructive">
          {errorMessage}
        </div>
      )}

      {/* Common fields */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <div className={fieldWrapperClassName}>
          <label htmlFor="fullName" className={labelClassName}>
            Ad Soyad*
          </label>
          <Input
            id="fullName"
            className={fieldClassName}
            {...register("fullName")}
            onFocus={handleFieldInteraction}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message as string}</p>
          )}
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="email" className={labelClassName}>
            E-Posta*
          </label>
          <Input
            id="email"
            type="email"
            className={fieldClassName}
            {...register("email")}
            onFocus={handleFieldInteraction}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message as string}</p>
          )}
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="phone" className={labelClassName}>
            Telefon*
          </label>
          <Input
            id="phone"
            type="tel"
            className={fieldClassName}
            {...register("phone")}
            onFocus={handleFieldInteraction}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message as string}</p>
          )}
        </div>

        <div className={fieldWrapperClassName}>
          <label htmlFor="company" className={labelClassName}>
            Şirket
          </label>
          <Input
            id="company"
            className={fieldClassName}
            {...register("company")}
            onFocus={handleFieldInteraction}
          />
        </div>
      </div>

      {/* Intent-specific fields */}
      <IntentFieldSections
        leadType={leadType}
        register={register as any}
        errors={getSectionErrors(errors, leadType)}
      />

      {/* Message */}
      <div className={fieldWrapperClassName}>
        <label htmlFor="message" className={labelClassName}>
          Mesajınız*
        </label>
        <Textarea
          id="message"
          className="min-h-[12rem] rounded-sm border-border/80 bg-card/68 px-4 py-4 text-base focus-visible:border-ring md:min-h-[14rem] md:px-5 md:text-base"
          {...register("message")}
          onFocus={handleFieldInteraction}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message as string}</p>
        )}
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
          />
          <label htmlFor="kvkkConsent" className="cursor-pointer text-sm leading-6 text-muted-foreground">
            Kişisel verileriniz sizinle iletişime geçmek amacıyla alınmaktadır.{" "}
            <Link href="/kvkk" className="text-primary transition-colors hover:text-primary/80">
              Aydınlatma Metni
            </Link>
            &apos;ni okudum, onaylıyorum.*
          </label>
        </div>
        {errors.kvkkConsent && (
          <p className="pl-7 text-sm text-destructive">{errors.kvkkConsent.message as string}</p>
        )}
        <div className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          Kişisel verilerinizin işlenmesi ile ilgili Aydınlatma Metnine{" "}
          <Link href="/kvkk" className="text-primary transition-colors hover:text-primary/80">
            buradan
          </Link>{" "}
          erişebilirsiniz.
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-4 sm:items-start md:flex-row md:items-end md:justify-between">
        <div className="flex-1" />

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-md px-7 text-base font-semibold sm:w-auto md:text-lg"
        >
          {isPending ? "Gönderiliyor..." : "Gönder"}
        </Button>
      </div>
    </form>
  );
}

function getSectionErrors(
  errors: Record<string, { message?: unknown } | undefined>,
  leadType: LeadType
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  const fieldMap: Record<LeadType, string[]> = {
    corporate_training_request: ["interestTopic"],
    instructor_application: ["expertiseAreas"],
    solution_partner_application: ["companySize", "partnershipDetails"],
    general_contact: [],
  };
  for (const field of fieldMap[leadType]) {
    const err = errors[field];
    result[field] = err?.message ? String(err.message) : undefined;
  }
  return result;
}

function getErrorMessage(payload: unknown): string {
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
      return "Geçersiz başvuru türü. Lütfen sayfayı yenileyip tekrar deneyin.";
    }
    if (
      message ===
      "fullName, email, phone, and message are required"
    ) {
      return "Lütfen zorunlu alanların tamamını doldurun.";
    }
    return message;
  }
  return "Form gönderilemedi. Lütfen tekrar deneyin.";
}

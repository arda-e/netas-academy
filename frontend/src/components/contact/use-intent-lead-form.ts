import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { LeadType } from "@/lib/lead-intents";
import {
  buildIntentLeadUrl,
  getLeadIntents,
  getSchemaForLeadType,
} from "@/lib/lead-intents";
import { FormStorage } from "@/lib/form-storage";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import {
  emitLeadContextualEntry,
  emitLeadFormStart,
  emitLeadRelatedContentClick,
  emitLeadSubmitFail,
  emitLeadSubmitSuccess,
  emitLeadTabChange,
  emitLeadTabView,
} from "@/lib/analytics-events";
import type { FieldErrors, FormValues } from "./contact-form-utils";
import { getErrorMessage, normalizeFormValues } from "./contact-form-utils";

const isTurnstileEnabled =
  process.env.NODE_ENV === "production" &&
  Boolean(process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY);

type UseIntentLeadFormProps = {
  initialLeadType: LeadType | null;
  prefilledTopic?: string;
};

export function useIntentLeadForm({ initialLeadType, prefilledTopic }: UseIntentLeadFormProps) {
  const t = useTranslations("contact");
  const leadIntents = getLeadIntents(t);
  const router = useRouter();
  const pathname = usePathname();

  const [leadType, setLeadType] = useState<LeadType | null>(initialLeadType);
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const hasEmittedStartRef = useRef(false);
  const previousLeadTypeRef = useRef<LeadType | null>(leadType);
  const storageKey = `contact-form-${leadType ?? "unselected"}`;

  const { save: persistValues, clear: clearStorage } = useFormPersistence<FormValues>(
    storageKey,
    { sensitiveFields: [] }
  );

  useEffect(() => {
    if (leadType) {
      emitLeadTabView(leadType);
    }
  }, [leadType]);

  useEffect(() => {
    if (initialLeadType && initialLeadType !== "general_contact") {
      emitLeadContextualEntry(initialLeadType);
    }
  }, [initialLeadType]);

  const { register, getValues, reset, setValue, watch } = useForm<FormValues>({
    shouldUnregister: true,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      interestTopic: prefilledTopic || "",
      expertiseAreas: "",
      partnershipDetails: "",
      kvkkConsent: false,
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Restore form values from sessionStorage on mount.
  // Uses a direct FormStorage call with initialLeadType to avoid hook complication
  // when leadType may have already changed on re-render.
  useEffect(() => {
    const saved = new FormStorage(`contact-form-${initialLeadType ?? "unselected"}`).load<FormValues>();
    if (saved) {
      reset({
        fullName: saved.fullName ?? "",
        email: saved.email ?? "",
        phone: saved.phone ?? "",
        company: saved.company ?? "",
        message: saved.message ?? "",
        interestTopic: saved.interestTopic ?? prefilledTopic ?? "",
        expertiseAreas: saved.expertiseAreas ?? "",
        partnershipDetails: saved.partnershipDetails ?? "",
        kvkkConsent: saved.kvkkConsent ?? false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset form only when switching intent. Route back/forward can remount or
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
      partnershipDetails: "",
      kvkkConsent: false,
    });
    hasEmittedStartRef.current = false;
    new FormStorage(`contact-form-${previousLeadType ?? "unselected"}`).clear();
    setTurnstileToken(null);
    setTurnstileResetKey((key) => key + 1);
  }, [leadType, reset, prefilledTopic]);

  // Persist only after real form changes so the first render cannot overwrite
  // restored sessionStorage values with empty defaults.
  useEffect(() => {
    const subscription = watch((values) => {
      persistValues(normalizeFormValues(values as Partial<FormValues>));
    });
    return () => subscription.unsubscribe();
  }, [watch, persistValues]);

  const kvkkReturnTo = leadType
    ? buildIntentLeadUrl(leadType, prefilledTopic ? { topic: prefilledTopic } : undefined)
    : "/iletisim";

  const handleFieldInteraction = useCallback(() => {
    if (!leadType || hasEmittedStartRef.current) {
      return;
    }
    hasEmittedStartRef.current = true;
    emitLeadFormStart(leadType);
  }, [leadType]);

  const handleKvkkConsentChange = useCallback(
    (isSelected: boolean) => {
      setValue("kvkkConsent", isSelected, { shouldDirty: true });
      handleFieldInteraction();
    },
    [handleFieldInteraction, setValue]
  );

  const handleIntentChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const nextLeadType = (e.target.value || null) as LeadType | null;
      if (nextLeadType !== leadType) {
        if (leadType && nextLeadType) {
          emitLeadTabChange(leadType, nextLeadType);
        }
        if (nextLeadType && !hasEmittedStartRef.current) {
          hasEmittedStartRef.current = true;
          emitLeadFormStart(nextLeadType);
        }
        setErrorMessage(null);
        setFieldErrors({});
        setLeadType(nextLeadType);
        if (nextLeadType) {
          const params = new URLSearchParams({ intent: nextLeadType });
          if (prefilledTopic) {
            params.set("topic", prefilledTopic);
          }
          router.replace(`${pathname}?${params.toString()}`);
        } else {
          router.replace(pathname);
        }
      }
    },
    [leadType, pathname, prefilledTopic, router]
  );

  const persistCurrentValues = useCallback(() => {
    persistValues(getValues());
  }, [getValues, persistValues]);

  const handleNewSubmission = useCallback(() => {
    if (leadType) {
      emitLeadRelatedContentClick(leadType);
    }
    hasEmittedStartRef.current = false;
    clearStorage();
    setTurnstileToken(null);
    setTurnstileResetKey((key) => key + 1);
    setFormKey((k) => k + 1);
    setSuccess(false);
  }, [leadType, clearStorage]);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setErrorMessage((current) => (current === t("error.human_check_required") ? null : current));
  }, [t]);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileResetKey((key) => key + 1);
  }, []);

  const onSubmit = useCallback(
    (data: FormValues) => {
      setErrorMessage(null);
      hasEmittedStartRef.current = true;

      if (!leadType) {
        setFieldErrors({
          leadType: t("validation.request_type_required"),
        });
        return;
      }

      if (isTurnstileEnabled && !turnstileToken) {
        const reason = t("error.human_check_required");
        setErrorMessage(reason);
        emitLeadSubmitFail(leadType, reason);
        return;
      }

      const payload = {
        leadType,
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        company: data.company?.trim() || undefined,
        message: data.message.trim(),
        interestTopic: data.interestTopic?.trim() || undefined,
        expertiseAreas: data.expertiseAreas?.trim() || undefined,
        partnershipDetails: data.partnershipDetails?.trim() || undefined,
        kvkkConsent: data.kvkkConsent,
        turnstileToken: turnstileToken ?? undefined,
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
            resetTurnstile();
            return;
          }

          setSuccess(true);
          emitLeadSubmitSuccess(leadType);
          clearStorage();
          resetTurnstile();
          reset();
        } catch {
          const reason = t("error.submit_failed");
          setErrorMessage(reason);
          emitLeadSubmitFail(leadType, reason);
          resetTurnstile();
        }
      });
    },
    [leadType, reset, clearStorage, t, turnstileToken, resetTurnstile]
  );

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!leadType) {
        setFieldErrors({
          leadType: t("validation.request_type_required"),
        });
        setErrorMessage(null);
        return;
      }
      const schema = getSchemaForLeadType(t, leadType);
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
    [getValues, leadType, onSubmit, t]
  );

  return {
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
    kvkkConsent: watch("kvkkConsent"),
    handleIntentChange,
    handleFieldInteraction,
    handleKvkkConsentChange,
    handleFormSubmit,
    handleNewSubmission,
    persistCurrentValues,
    handleTurnstileVerify,
    handleTurnstileExpire,
  };
}

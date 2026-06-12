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

type UseIntentLeadFormProps = {
  initialLeadType: LeadType;
  prefilledTopic?: string;
};

export function useIntentLeadForm({ initialLeadType, prefilledTopic }: UseIntentLeadFormProps) {
  const t = useTranslations("contact");
  const leadIntents = getLeadIntents(t);
  const router = useRouter();
  const pathname = usePathname();

  const [leadType, setLeadType] = useState<LeadType>(initialLeadType);
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();
  const hasEmittedStartRef = useRef(false);
  const previousLeadTypeRef = useRef<LeadType>(leadType);

  const { save: persistValues, clear: clearStorage } = useFormPersistence<FormValues>(
    `contact-form-${leadType}`,
    { sensitiveFields: [] }
  );

  useEffect(() => {
    emitLeadTabView(leadType);
  }, [leadType]);

  useEffect(() => {
    if (initialLeadType !== "general_contact") {
      emitLeadContextualEntry(initialLeadType);
    }
  }, [initialLeadType]);

  const schema = getSchemaForLeadType(t, leadType);
  const { register, getValues, reset, watch } = useForm<FormValues>({
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
    new FormStorage(`contact-form-${previousLeadType}`).clear();
  }, [leadType, reset, prefilledTopic]);

  // Persist only after real form changes so the first render cannot overwrite
  // restored sessionStorage values with empty defaults.
  useEffect(() => {
    const subscription = watch((values) => {
      persistValues(normalizeFormValues(values as Partial<FormValues>));
    });
    return () => subscription.unsubscribe();
  }, [watch, persistValues]);

  const kvkkReturnTo = buildIntentLeadUrl(
    leadType,
    prefilledTopic ? { topic: prefilledTopic } : undefined
  );

  const handleFieldInteraction = useCallback(() => {
    if (!hasEmittedStartRef.current) {
      hasEmittedStartRef.current = true;
      emitLeadFormStart(leadType);
    }
  }, [leadType]);

  const handleIntentChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const type = e.target.value as LeadType;
      if (type !== leadType) {
        emitLeadTabChange(leadType, type);
        setErrorMessage(null);
        setFieldErrors({});
        setLeadType(type);
        router.replace(`${pathname}?intent=${type}`);
      }
    },
    [leadType, pathname, router]
  );

  const persistCurrentValues = useCallback(() => {
    persistValues(getValues());
  }, [getValues, persistValues]);

  const handleNewSubmission = useCallback(() => {
    emitLeadRelatedContentClick(leadType);
    hasEmittedStartRef.current = false;
    clearStorage();
    setFormKey((k) => k + 1);
    setSuccess(false);
  }, [leadType, clearStorage]);

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

  return {
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
  };
}

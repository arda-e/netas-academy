"use client";

import { z } from "zod";
import { ChangeEvent, FocusEvent, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import type { StrapiEventType } from "@/lib/strapi-types";
import { isValidTckn, normalizeTcknValue } from "@/lib/tckn";
import { useFormPersistence } from "@/hooks/use-form-persistence";

type PaymentPresentation = {
  kind: "iyzico_checkout_form";
  token: string;
  checkoutFormContent: string;
  providerPageUrl?: string | null;
};

export type EventRegistrationPayment = {
  attemptReference: string;
  status: "checkout_created" | "payment_unavailable";
  provider: "iyzico";
  presentation?: PaymentPresentation;
  error?: {
    code: string;
    message: string;
  };
};

type RegistrationResponsePayload = {
  nextAction?: "registration_received" | "render_checkout" | "payment_retry";
  payment?: EventRegistrationPayment;
};

type EventRegistrationValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tckn: string;
  notes: string;
  kvkkConsent: boolean;
};

type FieldErrors = Partial<Record<"firstName" | "lastName" | "phone" | "tckn", string>>;

type UseEventRegistrationFormOptions = {
  eventDocumentId: string;
  eventTitle: string;
  eventType?: StrapiEventType;
};

const initialValues: EventRegistrationValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  tckn: "",
  notes: "",
  kvkkConsent: false,
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const sanitizeStoredValues = (values: EventRegistrationValues): EventRegistrationValues => ({
  ...values,
  lastName: values.lastName.slice(0, 20),
  phone: digitsOnly(values.phone),
  tckn: digitsOnly(values.tckn).slice(0, 11),
});

export function useEventRegistrationForm({
  eventDocumentId,
  eventTitle,
  eventType,
}: UseEventRegistrationFormOptions) {
  const t = useTranslations('event_reg');

  function getErrorMessage(payload: unknown) {
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

      if (message === "Event registration is closed") {
        return t('error.event_closed');
      }

      if (message === "Event not found") {
        return t('error.event_not_found');
      }

      if (message === "Invalid TCKN") {
        return t('error.invalid_tckn');
      }

      if (message === "kvkkConsent must be true") {
        return t('error.kvkk_not_approved');
      }

      return message;
    }

    return t('error.unexpected');
  }

  const { load, save: persistValues, clear: clearStorage } =
    useFormPersistence<EventRegistrationValues>(
      `event-registration-${eventDocumentId}`,
      { sensitiveFields: ["tckn"] }
    );

  // KVKK consent is required only for egitim/kurs events, not etkinlik
  const requiresKvkkConsent = eventType === "egitim" || eventType === "kurs";

  // TCKN is required only for egitim/kurs events, not etkinlik
  // Positive matching so undefined eventType (event not yet loaded) defaults to no TCKN required
  const requiresTckn = eventType === "egitim" || eventType === "kurs";
  const [values, setValues] = useState<EventRegistrationValues>(() => {
    const saved = load();
    return saved ? sanitizeStoredValues(saved) : initialValues;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<EventRegistrationPayment | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Persist form values to sessionStorage on every change
  useEffect(() => {
    persistValues(values);
  }, [values, persistValues]);

  const fieldSchemas = {
    firstName: z.string().trim().min(5, t("validation.first_name_min_5")),
    lastName: z
      .string()
      .trim()
      .min(5, t("validation.last_name_min_5"))
      .max(20, t("validation.last_name_max_20")),
    phone: z.string().trim().regex(/^\d*$/, t("validation.phone_invalid")),
  };

  const validateField = (field: keyof typeof fieldSchemas, value: string) => {
    const result = fieldSchemas[field].safeParse(value);
    return result.success ? null : result.error.issues[0].message;
  };

  const updateFieldError = (field: keyof FieldErrors, error: string | null) => {
    setFieldErrors((currentErrors) => {
      if (!error) {
        const nextErrors = { ...currentErrors };
        delete nextErrors[field];
        return nextErrors;
      }

      return {
        ...currentErrors,
        [field]: error,
      };
    });
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { currentTarget } = event;
    const { name } = event.target;
    if (name === "kvkkConsent" && currentTarget instanceof HTMLInputElement) {
      setValues((currentValues) => ({
        ...currentValues,
        kvkkConsent: currentTarget.checked,
      }));
      return;
    }

    const rawValue = currentTarget.value;
    const nextValue =
      name === "phone" || name === "tckn"
        ? digitsOnly(rawValue)
        : name === "lastName"
          ? rawValue.slice(0, 20)
          : rawValue;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }));
  };

  const handleKvkkConsentChange = (isSelected: boolean) => {
    setValues((currentValues) => ({
      ...currentValues,
      kvkkConsent: isSelected,
    }));
  };

  const handleFieldBlur = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = event.currentTarget;

    if (name === "firstName" || name === "lastName" || name === "phone") {
      const fieldName = name as keyof typeof fieldSchemas;
      updateFieldError(fieldName, validateField(fieldName, values[fieldName]));
      return;
    }

    if (name === "tckn" && requiresTckn) {
      const normalizedTckn = normalizeTcknValue(values.tckn);
      updateFieldError(
        "tckn",
        isValidTckn(normalizedTckn) ? null : t("error.invalid_tckn")
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const nextFieldErrors: FieldErrors = {};

    for (const field of ["firstName", "lastName", "phone"] as const) {
      const error = validateField(field, values[field]);
      if (error) {
        nextFieldErrors[field] = error;
      }
    }

    const normalizedTckn = requiresTckn ? normalizeTcknValue(values.tckn) : "";

    if (requiresTckn && !isValidTckn(normalizedTckn)) {
      nextFieldErrors.tckn = t("error.invalid_tckn");
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setIsSubmitting(false);
      return;
    }

    setFieldErrors({});

    if (requiresKvkkConsent && !values.kvkkConsent) {
      setErrorMessage(t('validation.kvkk_required'));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/registrations/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventDocumentId,
          student: {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            ...(requiresTckn ? { tckn: normalizedTckn } : {}),
          },
          notes: values.notes.trim() || undefined,
          kvkkConsent: values.kvkkConsent,
        }),
      });

      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        setErrorMessage(getErrorMessage(payload));
        return;
      }

      const registration = payload as RegistrationResponsePayload;
      if (registration.nextAction === "render_checkout" && registration.payment?.presentation?.kind === "iyzico_checkout_form") {
        setPayment(registration.payment);
        clearStorage();
        return;
      }

      if (registration.payment?.status === "payment_unavailable" || registration.nextAction === "payment_retry") {
        setPayment(registration.payment ?? null);
        setErrorMessage(registration.payment?.error?.message ?? t("payment.error_unavailable"));
        return;
      }

      setSuccessMessage(
        t('success.with_title', { title: eventTitle })
      );
      clearStorage();
      setValues(initialValues);
    } catch {
      setErrorMessage(t('error.request_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!payment?.attemptReference) {
      return;
    }

    setIsRetryingPayment(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/payments/${encodeURIComponent(payment.attemptReference)}/retry`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as EventRegistrationPayment | { error?: { message?: string } } | null;

      if (!response.ok) {
        setErrorMessage(
          payload && "error" in payload && payload.error?.message
            ? payload.error.message
            : t("payment.error_unavailable"),
        );
        return;
      }

      const nextPayment = payload as EventRegistrationPayment;
      setPayment(nextPayment);
      if (nextPayment.status !== "checkout_created") {
        setErrorMessage(nextPayment.error?.message ?? t("payment.error_unavailable"));
      }
    } catch {
      setErrorMessage(t("payment.error_unavailable"));
    } finally {
      setIsRetryingPayment(false);
    }
  };

  return {
    values,
    fieldErrors,
    isSubmitting,
    isRetryingPayment,
    errorMessage,
    successMessage,
    payment,
    handleChange,
    handleKvkkConsentChange,
    handleFieldBlur,
    handleSubmit,
    handleRetryPayment,
    requiresKvkkConsent,
    requiresTckn,
  };
}

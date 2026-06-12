"use client";

import { z } from "zod";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import type { StrapiEventType } from "@/lib/strapi-types";
import { isValidTckn, normalizeTcknValue } from "@/lib/tckn";
import { useFormPersistence } from "@/hooks/use-form-persistence";

type EventRegistrationValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tckn: string;
  notes: string;
  kvkkConsent: boolean;
};

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
    return saved ?? initialValues;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Persist form values to sessionStorage on every change
  useEffect(() => {
    persistValues(values);
  }, [values, persistValues]);

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

    setValues((currentValues) => ({
      ...currentValues,
      [name]: currentTarget.value,
    }));
  };

  const formSchema = z.object({
    firstName: z.string().min(5, t('validation.first_name_min_5')),
    lastName: z.string().min(5, t('validation.last_name_min_5')),
    phone: z.string().min(1, t('validation.phone_required')).regex(/^[\d\s()+\-]+$/, t('validation.phone_invalid')),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const nameResult = formSchema.safeParse(values);
    if (!nameResult.success) {
      setErrorMessage(nameResult.error.issues[0].message);
      setIsSubmitting(false);
      return;
    }

    const normalizedTckn = requiresTckn ? normalizeTcknValue(values.tckn) : "";

    if (requiresTckn && !isValidTckn(normalizedTckn)) {
      setErrorMessage(t('error.invalid_tckn'));
      setIsSubmitting(false);
      return;
    }

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

  return {
    values,
    isSubmitting,
    errorMessage,
    successMessage,
    handleChange,
    handleSubmit,
    requiresKvkkConsent,
    requiresTckn,
  };
}

"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

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
      return "Bu etkinlik icin kayitlar kapandi. Kayitlar etkinlik baslangicindan 24 saat once otomatik olarak kapanir.";
    }

    if (message === "Event not found") {
      return "Etkinlik bulunamadi.";
    }

    if (message === "Invalid TCKN") {
      return "Gecerli bir TCKN girin.";
    }

    if (message === "kvkkConsent must be true") {
      return "KVKK aydinlatma metnini onaylamaniz gerekmektedir.";
    }

    return message;
  }

  return "Kayit sirasinda beklenmeyen bir sorun olustu.";
}

export function useEventRegistrationForm({
  eventDocumentId,
  eventTitle,
  eventType,
}: UseEventRegistrationFormOptions) {
  const { load, save: persistValues, clear: clearStorage } =
    useFormPersistence<EventRegistrationValues>(
      `event-registration-${eventDocumentId}`,
      { sensitiveFields: ["tckn"] }
    );

  // KVKK consent is required only for egitim/kurs events, not etkinlik
  const requiresKvkkConsent = eventType === "egitim" || eventType === "kurs";

  // TCKN is required only for egitim/kurs events, not etkinlik
  const requiresTckn = eventType !== "etkinlik";
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!values.firstName.trim()) {
      setErrorMessage("Ad alani zorunludur.");
      setIsSubmitting(false);
      return;
    }

    if (!values.lastName.trim()) {
      setErrorMessage("Soyad alani zorunludur.");
      setIsSubmitting(false);
      return;
    }

    const normalizedTckn = requiresTckn ? normalizeTcknValue(values.tckn) : "";

    if (requiresTckn && !isValidTckn(normalizedTckn)) {
      setErrorMessage("Gecerli bir TCKN girin.");
      setIsSubmitting(false);
      return;
    }

    if (requiresKvkkConsent && !values.kvkkConsent) {
      setErrorMessage("Lutfen KVKK aydinlatma metnini okudugunuzu onaylayin.");
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
        `${eventTitle} etkinligi icin kaydiniz alindi. Ekibimiz kisa sure icinde sizinle iletisime gececek.`
      );
      clearStorage();
      setValues(initialValues);
    } catch {
      setErrorMessage("Kayit istegi gonderilemedi. Lutfen tekrar deneyin.");
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

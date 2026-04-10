"use client";

import { ChangeEvent, FormEvent, useState } from "react";

import type { StrapiEventType } from "@/lib/strapi";
import { isValidTckn, normalizeTcknValue } from "@/lib/tckn";

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
  eventType: StrapiEventType;
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

    if (message === "Student is already registered for this event") {
      return "Bu etkinlik icin daha once kayit oldunuz.";
    }

    if (message === "Event registration is closed") {
      return "Bu etkinlik icin kayitlar kapandi. Kayitlar etkinlik baslangicindan 24 saat once otomatik olarak kapanir.";
    }

    if (message === "Event not found") {
      return "Etkinlik bulunamadi.";
    }

    if (message === "Invalid TCKN") {
      return "Gecerli bir TCKN girin.";
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
  const requiresKvkkConsent = eventType === "egitim" || eventType === "kurs";
  const [values, setValues] = useState<EventRegistrationValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    const normalizedTckn = normalizeTcknValue(values.tckn);

    if (!isValidTckn(normalizedTckn)) {
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
            tckn: normalizedTckn,
          },
          notes: values.notes.trim() || undefined,
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
  };
}

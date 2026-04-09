"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type EventRegistrationValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
};

type UseEventRegistrationFormOptions = {
  eventDocumentId: string;
  eventTitle: string;
};

const initialValues: EventRegistrationValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
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

    if (message === "Event not found") {
      return "Etkinlik bulunamadi.";
    }

    return message;
  }

  return "Kayit sirasinda beklenmeyen bir sorun olustu.";
}

export function useEventRegistrationForm({
  eventDocumentId,
  eventTitle,
}: UseEventRegistrationFormOptions) {
  const [values, setValues] = useState<EventRegistrationValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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
  };
}

"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
};

const initialValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
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

    if (
      message ===
      "firstName, lastName, email, phone, subject, and message are required"
    ) {
      return "Lütfen zorunlu alanların tamamını doldurun.";
    }

    return message;
  }

  return "Mesajınız gönderilemedi. Lütfen tekrar deneyin.";
}

export function useContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setErrorMessage(null);
    setSuccessMessage(null);

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
      const response = await fetch("/api/contact-submissions/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          company: values.company.trim() || undefined,
          subject: values.subject.trim(),
          message: values.message.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        setErrorMessage(getErrorMessage(payload));
        return;
      }

      setSuccessMessage(
        "Mesajınız kaydedildi. Ekibimiz en kısa süre içinde sizinle iletişime geçecek."
      );
      setValues(initialValues);
    } catch {
      setErrorMessage("Mesaj isteği gönderilemedi. Lütfen tekrar deneyin.");
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

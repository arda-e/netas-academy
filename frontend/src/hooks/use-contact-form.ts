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

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

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

function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Adınızı girin.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Soyadınızı girin.";
  }

  if (!values.email.trim()) {
    errors.email = "E-posta adresinizi girin.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Geçerli bir e-posta adresi girin.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Telefon numaranızı girin.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Konu alanını doldurun.";
  }

  if (!values.message.trim()) {
    errors.message = "Mesajınızı yazın.";
  }

  return errors;
}

export function useContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<ContactFormErrors>({});

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setErrorMessage(null);
    setSuccessMessage(null);
    setErrors((currentErrors) => {
      if (!(name in currentErrors)) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name as keyof ContactFormErrors];
      return nextErrors;
    });

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

    const validationErrors = validateContactForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});

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
      setErrors({});
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
    errors,
    handleChange,
    handleSubmit,
  };
}

"use client";

import { ChangeEvent, FormEvent, useState } from "react";

const contactRecipients = ["einanc@netas.com.tr", "pcaglar@netas.com.tr"];

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

function buildMailtoLink(values: ContactFormValues) {
  const subject = `[Netaş Academy İletişim] ${values.subject.trim()}`;
  const messageLines = [
    "Netaş Academy iletişim formu üzerinden yeni bir mesaj alındı.",
    "",
    `Ad Soyad: ${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
    `E-Posta: ${values.email.trim()}`,
    `Telefon: ${values.phone.trim()}`,
    values.company.trim() ? `Şirket: ${values.company.trim()}` : null,
    "",
    "Mesaj:",
    values.message.trim(),
  ].filter(Boolean);

  const searchParams = new URLSearchParams({
    subject,
    body: messageLines.join("\n"),
  });

  return `mailto:${contactRecipients.join(",")}?${searchParams.toString()}`;
}

export function useContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (submitMessage) {
      setSubmitMessage("");
    }

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      window.location.href = buildMailtoLink(values);
      setSubmitMessage(
        "E-posta uygulamanız açılmadıysa einanc@netas.com.tr ve pcaglar@netas.com.tr adreslerine doğrudan yazabilirsiniz."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    isSubmitting,
    submitMessage,
    contactRecipients,
    handleChange,
    handleSubmit,
  };
}

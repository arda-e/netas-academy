import type {
  ContactSubmissionNotificationPayload,
  EventRegistrationNotificationPayload,
  InternalNotificationEmail,
  InternalNotificationEnvelope,
} from "./types";

const formatOptionalValue = (value?: string | null) => value?.trim() || "Belirtilmedi";

const buildContactSubmissionEmail = (
  payload: ContactSubmissionNotificationPayload,
): InternalNotificationEmail => ({
  subject: `Iletisim Formu Bildirimi - ${payload.subject}`,
  text: [
    "Siteden yeni bir iletisim formu gonderimi alindi.",
    "",
    `Basvuru No: ${payload.submissionId}`,
    `Gonderim Tarihi: ${payload.submittedAt}`,
    `Ad Soyad: ${payload.fullName}`,
    `E-posta: ${payload.email}`,
    `Konu: ${payload.subject}`,
    `Telefon: ${formatOptionalValue(payload.phone)}`,
    `Sirket: ${formatOptionalValue(payload.company)}`,
    "",
    "Mesaj:",
    payload.message,
  ].join("\n"),
});

const buildEventRegistrationEmail = (
  payload: EventRegistrationNotificationPayload,
): InternalNotificationEmail => {
  const studentName = [payload.student.firstName, payload.student.lastName]
    .filter((part) => part && part.trim().length > 0)
    .join(" ");

  return {
    subject: `Etkinlik Kayit Bildirimi - ${payload.event.title}`,
    text: [
      "Yeni bir etkinlik kayit talebi olusturuldu.",
      "",
      `Kayit No: ${payload.registrationId}`,
      `Durum: ${payload.status}`,
      `Etkinlik: ${payload.event.title}`,
      `Etkinlik Belge ID: ${payload.event.documentId}`,
      `Slug: ${payload.event.slug}`,
      `Baslangic: ${payload.event.startsAt}`,
      `Konum: ${formatOptionalValue(payload.event.location)}`,
      "",
      `Ogrenci: ${studentName}`,
      `E-posta: ${payload.student.email}`,
      `Telefon: ${formatOptionalValue(payload.student.phone)}`,
      `TCKN: ${payload.student.tckn}`,
      `Notlar: ${formatOptionalValue(payload.notes)}`,
    ].join("\n"),
  };
};

export const buildInternalNotificationEmail = (
  envelope: InternalNotificationEnvelope,
): InternalNotificationEmail => {
  switch (envelope.key) {
    case "contact_submission":
      return buildContactSubmissionEmail(envelope.payload as ContactSubmissionNotificationPayload);
    case "event_registration":
      return buildEventRegistrationEmail(envelope.payload as EventRegistrationNotificationPayload);
    default:
      throw new Error(`Unsupported internal notification key: ${String(envelope.key)}`);
  }
};

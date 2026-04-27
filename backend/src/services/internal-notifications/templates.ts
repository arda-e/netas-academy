import type {
  CourseApplicationNotificationPayload,
  ContactSubmissionNotificationPayload,
  CorporateTrainingLeadPayload,
  EventRegistrationNotificationPayload,
  InstructorApplicationLeadPayload,
  InternalNotificationEmail,
  InternalNotificationEnvelope,
  SolutionPartnerLeadPayload,
} from "./types";

const formatOptionalValue = (value?: string | null) => value?.trim() || "Belirtilmedi";

const buildContactSubmissionEmail = (
  payload: ContactSubmissionNotificationPayload,
): InternalNotificationEmail => {
  const subjectLine = payload.subject
    ? `Iletisim Formu Bildirimi - ${payload.subject}`
    : "Iletisim Formu Bildirimi";

  return {
    subject: subjectLine,
    text: [
      "Siteden yeni bir iletisim formu gonderimi alindi.",
      "",
      `Basvuru No: ${payload.submissionId}`,
      `Gonderim Tarihi: ${payload.submittedAt}`,
      `Ad Soyad: ${payload.fullName}`,
      `E-posta: ${payload.email}`,
      payload.subject ? `Konu: ${payload.subject}` : "",
      `Telefon: ${formatOptionalValue(payload.phone)}`,
      `Sirket: ${formatOptionalValue(payload.company)}`,
      "",
      "Mesaj:",
      payload.message,
    ].filter(Boolean).join("\n"),
  };
};

const buildCorporateTrainingLeadEmail = (
  payload: CorporateTrainingLeadPayload,
): InternalNotificationEmail => ({
  subject: `Kurumsal Egitim Talebi - ${payload.fullName}`,
  text: [
    "Siteden yeni bir kurumsal egitim talebi alindi.",
    "",
    `Basvuru No: ${payload.submissionId}`,
    `Gonderim Tarihi: ${payload.submittedAt}`,
    `Ad Soyad: ${payload.fullName}`,
    `E-posta: ${payload.email}`,
    `Telefon: ${formatOptionalValue(payload.phone)}`,
    `Sirket: ${formatOptionalValue(payload.company)}`,
    `Ilgi Konusu: ${formatOptionalValue(payload.interestTopic)}`,
    "",
    "Mesaj:",
    payload.message,
  ].join("\n"),
});

const buildInstructorApplicationEmail = (
  payload: InstructorApplicationLeadPayload,
): InternalNotificationEmail => ({
  subject: `Egitmen Basvurusu - ${payload.fullName}`,
  text: [
    "Siteden yeni bir egitmen basvurusu alindi.",
    "",
    `Basvuru No: ${payload.submissionId}`,
    `Gonderim Tarihi: ${payload.submittedAt}`,
    `Ad Soyad: ${payload.fullName}`,
    `E-posta: ${payload.email}`,
    `Telefon: ${formatOptionalValue(payload.phone)}`,
    `Sirket: ${formatOptionalValue(payload.company)}`,
    `Uzmanlik Alanlari: ${formatOptionalValue(payload.expertiseAreas)}`,
    "",
    "Mesaj:",
    payload.message,
  ].join("\n"),
});

const buildSolutionPartnerEmail = (
  payload: SolutionPartnerLeadPayload,
): InternalNotificationEmail => ({
  subject: `Cozum Ortakligi Basvurusu - ${payload.fullName}`,
  text: [
    "Siteden yeni bir cozum ortakligi basvurusu alindi.",
    "",
    `Basvuru No: ${payload.submissionId}`,
    `Gonderim Tarihi: ${payload.submittedAt}`,
    `Ad Soyad: ${payload.fullName}`,
    `E-posta: ${payload.email}`,
    `Telefon: ${formatOptionalValue(payload.phone)}`,
    `Sirket: ${formatOptionalValue(payload.company)}`,
    `Sirket Buyuklugu: ${formatOptionalValue(payload.companySize)}`,
    `Ortaklik Detaylari: ${formatOptionalValue(payload.partnershipDetails)}`,
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

const buildCourseApplicationEmail = (
  payload: CourseApplicationNotificationPayload,
  headline: string,
  subjectPrefix: string,
): InternalNotificationEmail => {
  const studentName = [payload.student.firstName, payload.student.lastName]
    .filter((part) => part && part.trim().length > 0)
    .join(" ");

  return {
    subject: `${subjectPrefix} - ${payload.course.title}`,
    text: [
      headline,
      "",
      `Basvuru No: ${payload.applicationNumber}`,
      `Basvuru ID: ${payload.applicationId}`,
      `Durum: ${payload.status}`,
      `Next Action: ${payload.nextAction}`,
      `Kurs: ${payload.course.title}`,
      `Kurs Belge ID: ${payload.course.documentId}`,
      `Slug: ${payload.course.slug}`,
      "",
      `Ogrenci: ${studentName}`,
      `E-posta: ${payload.student.email}`,
      `Telefon: ${formatOptionalValue(payload.student.phone)}`,
      `TCKN: ${payload.student.tckn}`,
      `Odeme Linki: ${formatOptionalValue(payload.paymentUrl ?? null)}`,
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
    case "course_application_submitted":
      return buildCourseApplicationEmail(
        envelope.payload as CourseApplicationNotificationPayload,
        "Yeni bir kurs basvurusu olusturuldu.",
        "Kurs Basvurusu Bildirimi",
      );
    case "course_application_manual_review":
      return buildCourseApplicationEmail(
        envelope.payload as CourseApplicationNotificationPayload,
        "Bir kurs basvurusu manuel incelemeye alindi.",
        "Kurs Basvurusu Manuel Inceleme",
      );
    case "course_payment_pending":
      return buildCourseApplicationEmail(
        envelope.payload as CourseApplicationNotificationPayload,
        "Bir kurs basvurusu odeme bekliyor.",
        "Kurs Odeme Bekliyor",
      );
    case "lead_corporate_training":
      return buildCorporateTrainingLeadEmail(envelope.payload as CorporateTrainingLeadPayload);
    case "lead_instructor_application":
      return buildInstructorApplicationEmail(envelope.payload as InstructorApplicationLeadPayload);
    case "lead_solution_partner":
      return buildSolutionPartnerEmail(envelope.payload as SolutionPartnerLeadPayload);
    default:
      throw new Error(`Unsupported internal notification key: ${String(envelope.key)}`);
  }
};

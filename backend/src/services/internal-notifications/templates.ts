import { renderTemplate } from "../email-templates/renderer";
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

const fmt = (value?: string | null) => value?.trim() || "Belirtilmedi";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function htmlRow(label: string, value: string, isFirst = false): string {
  const border = isFirst ? "" : "border-top:1px solid #e2e8f0;";
  const pt = isFirst ? "14px" : "10px";
  return `<tr class="row-border" style="${border}"><td style="padding:${pt} 0 10px 0;font-family:Arial,Helvetica,sans-serif;"><span style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b;" class="text-muted">${esc(label)}</span><span style="display:block;margin-top:3px;font-size:14px;line-height:20px;color:#0f172a;white-space:pre-wrap;" class="text-main">${esc(value)}</span></td></tr>`;
}

async function buildHtml(params: {
  headline: string;
  preheader: string;
  badgeBg: string;
  badgeColor: string;
  badgeText: string;
  rows: string;
}): Promise<string | undefined> {
  try {
    return await renderTemplate("05_internal_notification.html", {
      headline: params.headline,
      preheader: params.preheader,
      badgeBg: params.badgeBg,
      badgeColor: params.badgeColor,
      badgeText: params.badgeText,
      rows: params.rows,
    });
  } catch {
    return undefined;
  }
}

/* ─── Contact submission ─── */

const buildContactSubmissionEmail = async (
  payload: ContactSubmissionNotificationPayload,
): Promise<InternalNotificationEmail> => {
  const subject = payload.subject
    ? `İletişim Formu Bildirimi - ${payload.subject}`
    : "İletişim Formu Bildirimi";

  const text = [
    "Siteden yeni bir iletisim formu gonderimi alindi.",
    "",
    `Basvuru No: ${payload.submissionId}`,
    `Gonderim Tarihi: ${payload.submittedAt}`,
    `Ad Soyad: ${payload.fullName}`,
    `E-posta: ${payload.email}`,
    payload.subject ? `Konu: ${payload.subject}` : "",
    `Telefon: ${fmt(payload.phone)}`,
    `Sirket: ${fmt(payload.company)}`,
    "",
    "Mesaj:",
    payload.message,
  ].filter(Boolean).join("\n");

  const rows = [
    htmlRow("Başvuru No", String(payload.submissionId), true),
    htmlRow("Gönderim Tarihi", formatDate(payload.submittedAt)),
    htmlRow("Ad Soyad", payload.fullName),
    htmlRow("E-posta", payload.email),
    payload.subject ? htmlRow("Konu", payload.subject) : "",
    htmlRow("Telefon", fmt(payload.phone)),
    htmlRow("Şirket", fmt(payload.company)),
    htmlRow("Mesaj", payload.message),
  ].filter(Boolean).join("");

  const html = await buildHtml({
    headline: "Genel İletişim Formu",
    preheader: `Yeni mesaj: ${payload.fullName}`,
    badgeBg: "#0ea5e9",
    badgeColor: "#ffffff",
    badgeText: "Genel İletişim",
    rows,
  });

  return { subject, text, html };
};

/* ─── Corporate training lead ─── */

const buildCorporateTrainingLeadEmail = async (
  payload: CorporateTrainingLeadPayload,
): Promise<InternalNotificationEmail> => {
  const subject = `Kurumsal Eğitim Talebi - ${payload.fullName}`;

  const text = [
    "Siteden yeni bir kurumsal egitim talebi alindi.",
    "",
    `Basvuru No: ${payload.submissionId}`,
    `Gonderim Tarihi: ${payload.submittedAt}`,
    `Ad Soyad: ${payload.fullName}`,
    `E-posta: ${payload.email}`,
    `Telefon: ${fmt(payload.phone)}`,
    `Sirket: ${fmt(payload.company)}`,
    `Ilgi Konusu: ${fmt(payload.interestTopic)}`,
    "",
    "Mesaj:",
    payload.message,
  ].join("\n");

  const rows = [
    htmlRow("Başvuru No", String(payload.submissionId), true),
    htmlRow("Gönderim Tarihi", formatDate(payload.submittedAt)),
    htmlRow("Ad Soyad", payload.fullName),
    htmlRow("E-posta", payload.email),
    htmlRow("Telefon", fmt(payload.phone)),
    htmlRow("Şirket", fmt(payload.company)),
    htmlRow("İlgi Konusu", fmt(payload.interestTopic)),
    htmlRow("Mesaj", payload.message),
  ].join("");

  const html = await buildHtml({
    headline: "Kurumsal Eğitim Talebi",
    preheader: `${payload.fullName} kurumsal eğitim talebinde bulundu`,
    badgeBg: "#009ca6",
    badgeColor: "#ffffff",
    badgeText: "Kurumsal Eğitim",
    rows,
  });

  return { subject, text, html };
};

/* ─── Instructor application ─── */

const buildInstructorApplicationEmail = async (
  payload: InstructorApplicationLeadPayload,
): Promise<InternalNotificationEmail> => {
  const subject = `Eğitmen Başvurusu - ${payload.fullName}`;

  const text = [
    "Siteden yeni bir egitmen basvurusu alindi.",
    "",
    `Basvuru No: ${payload.submissionId}`,
    `Gonderim Tarihi: ${payload.submittedAt}`,
    `Ad Soyad: ${payload.fullName}`,
    `E-posta: ${payload.email}`,
    `Telefon: ${fmt(payload.phone)}`,
    `Sirket: ${fmt(payload.company)}`,
    `Uzmanlik Alanlari: ${fmt(payload.expertiseAreas)}`,
    "",
    "Mesaj:",
    payload.message,
  ].join("\n");

  const rows = [
    htmlRow("Başvuru No", String(payload.submissionId), true),
    htmlRow("Gönderim Tarihi", formatDate(payload.submittedAt)),
    htmlRow("Ad Soyad", payload.fullName),
    htmlRow("E-posta", payload.email),
    htmlRow("Telefon", fmt(payload.phone)),
    htmlRow("Şirket", fmt(payload.company)),
    htmlRow("Uzmanlık Alanları", fmt(payload.expertiseAreas)),
    htmlRow("Mesaj", payload.message),
  ].join("");

  const html = await buildHtml({
    headline: "Eğitmen Başvurusu",
    preheader: `${payload.fullName} eğitmen başvurusunda bulundu`,
    badgeBg: "#8b5cf6",
    badgeColor: "#ffffff",
    badgeText: "Eğitmen Başvurusu",
    rows,
  });

  return { subject, text, html };
};

/* ─── Solution partner ─── */

const buildSolutionPartnerEmail = async (
  payload: SolutionPartnerLeadPayload,
): Promise<InternalNotificationEmail> => {
  const subject = `Çözüm Ortaklığı Başvurusu - ${payload.fullName}`;

  const text = [
    "Siteden yeni bir cozum ortakligi basvurusu alindi.",
    "",
    `Basvuru No: ${payload.submissionId}`,
    `Gonderim Tarihi: ${payload.submittedAt}`,
    `Ad Soyad: ${payload.fullName}`,
    `E-posta: ${payload.email}`,
    `Telefon: ${fmt(payload.phone)}`,
    `Sirket: ${fmt(payload.company)}`,
    `Ortaklik Detaylari: ${fmt(payload.partnershipDetails)}`,
    "",
    "Mesaj:",
    payload.message,
  ].join("\n");

  const rows = [
    htmlRow("Başvuru No", String(payload.submissionId), true),
    htmlRow("Gönderim Tarihi", formatDate(payload.submittedAt)),
    htmlRow("Ad Soyad", payload.fullName),
    htmlRow("E-posta", payload.email),
    htmlRow("Telefon", fmt(payload.phone)),
    htmlRow("Şirket", fmt(payload.company)),
    htmlRow("Ortaklık Detayları", fmt(payload.partnershipDetails)),
    htmlRow("Mesaj", payload.message),
  ].join("");

  const html = await buildHtml({
    headline: "Çözüm Ortaklığı Başvurusu",
    preheader: `${payload.fullName} çözüm ortaklığı başvurusunda bulundu`,
    badgeBg: "#10b981",
    badgeColor: "#ffffff",
    badgeText: "Çözüm Ortaklığı",
    rows,
  });

  return { subject, text, html };
};

/* ─── Event registration ─── */

const buildEventRegistrationEmail = async (
  payload: EventRegistrationNotificationPayload,
): Promise<InternalNotificationEmail> => {
  const studentName = [payload.student.firstName, payload.student.lastName]
    .filter((p) => p && p.trim().length > 0)
    .join(" ");

  const subject = `Etkinlik Kayıt Bildirimi - ${payload.event.title}`;

  const text = [
    "Yeni bir etkinlik kayit talebi olusturuldu.",
    "",
    `Kayit No: ${payload.registrationId}`,
    `Durum: ${payload.status}`,
    `Etkinlik: ${payload.event.title}`,
    `Etkinlik Belge ID: ${payload.event.documentId}`,
    `Slug: ${payload.event.slug}`,
    `Baslangic: ${payload.event.startsAt}`,
    `Konum: ${fmt(payload.event.location)}`,
    "",
    `Ogrenci: ${studentName}`,
    `E-posta: ${payload.student.email}`,
    `Telefon: ${fmt(payload.student.phone)}`,
    `TCKN: ${payload.student.tckn}`,
    `Notlar: ${fmt(payload.notes)}`,
  ].join("\n");

  const rows = [
    htmlRow("Kayıt No", String(payload.registrationId), true),
    htmlRow("Durum", payload.status),
    htmlRow("Etkinlik", payload.event.title),
    htmlRow("Başlangıç", formatDate(payload.event.startsAt)),
    htmlRow("Konum", fmt(payload.event.location)),
    htmlRow("Öğrenci", studentName),
    htmlRow("E-posta", payload.student.email),
    htmlRow("Telefon", fmt(payload.student.phone)),
    htmlRow("TCKN", payload.student.tckn),
    htmlRow("Notlar", fmt(payload.notes)),
  ].join("");

  const html = await buildHtml({
    headline: payload.event.title,
    preheader: `Yeni kayıt: ${studentName}`,
    badgeBg: "#f59e0b",
    badgeColor: "#ffffff",
    badgeText: "Etkinlik Kayıt",
    rows,
  });

  return { subject, text, html };
};

/* ─── Course application ─── */

const buildCourseApplicationEmail = async (
  payload: CourseApplicationNotificationPayload,
  headline: string,
  subjectPrefix: string,
  badgeText: string,
  badgeBg: string,
): Promise<InternalNotificationEmail> => {
  const studentName = [payload.student.firstName, payload.student.lastName]
    .filter((p) => p && p.trim().length > 0)
    .join(" ");

  const subject = `${subjectPrefix} - ${payload.course.title}`;

  const text = [
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
    `Telefon: ${fmt(payload.student.phone)}`,
    `TCKN: ${payload.student.tckn}`,
    `Odeme Linki: ${fmt(payload.paymentUrl ?? null)}`,
  ].join("\n");

  const rows = [
    htmlRow("Başvuru No", payload.applicationNumber, true),
    htmlRow("Durum", payload.status),
    htmlRow("Sonraki Adım", payload.nextAction),
    htmlRow("Kurs", payload.course.title),
    htmlRow("Öğrenci", studentName),
    htmlRow("E-posta", payload.student.email),
    htmlRow("Telefon", fmt(payload.student.phone)),
    htmlRow("TCKN", payload.student.tckn),
    payload.paymentUrl ? htmlRow("Ödeme Linki", payload.paymentUrl) : "",
  ].filter(Boolean).join("");

  const html = await buildHtml({
    headline,
    preheader: `${payload.course.title} — ${studentName}`,
    badgeBg,
    badgeColor: "#ffffff",
    badgeText,
    rows,
  });

  return { subject, text, html };
};

/* ─── Dispatcher ─── */

export const buildInternalNotificationEmail = async (
  envelope: InternalNotificationEnvelope,
): Promise<InternalNotificationEmail> => {
  switch (envelope.key) {
    case "contact_submission":
      return buildContactSubmissionEmail(envelope.payload as ContactSubmissionNotificationPayload);
    case "event_registration":
      return buildEventRegistrationEmail(envelope.payload as EventRegistrationNotificationPayload);
    case "course_application_submitted":
      return buildCourseApplicationEmail(
        envelope.payload as CourseApplicationNotificationPayload,
        "Yeni bir kurs başvurusu oluşturuldu.",
        "Kurs Başvurusu Bildirimi",
        "Kurs Başvurusu",
        "#0d9488",
      );
    case "course_application_manual_review":
      return buildCourseApplicationEmail(
        envelope.payload as CourseApplicationNotificationPayload,
        "Bir kurs başvurusu manuel incelemeye alındı.",
        "Kurs Başvurusu Manuel İnceleme",
        "Manuel İnceleme",
        "#f59e0b",
      );
    case "course_payment_pending":
      return buildCourseApplicationEmail(
        envelope.payload as CourseApplicationNotificationPayload,
        "Bir kurs başvurusu ödeme bekliyor.",
        "Kurs Ödeme Bekliyor",
        "Ödeme Bekliyor",
        "#f97316",
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

import { describe, expect, it } from "vitest";

import { buildInternalNotificationEmail } from "../../src/services/internal-notifications/templates";

describe("buildInternalNotificationEmail", () => {
  it("renders the contact submission notification in Turkish", () => {
    const email = buildInternalNotificationEmail({
      key: "contact_submission",
      payload: {
        submissionId: 42,
        fullName: "Ada Kaya",
        email: "ada@example.com",
        subject: "Kurumsal egitim talebi",
        phone: "+90 555 111 2233",
        company: "Netas",
        message: "Kurumsal egitimler hakkinda bilgi almak istiyorum.",
        submittedAt: "2026-04-21T14:30:00.000Z",
      },
    });

    expect(email.subject).toContain("Iletisim Formu Bildirimi");
    expect(email.text).toContain("Ada Kaya");
    expect(email.text).toContain("Kurumsal egitim talebi");
    expect(email.text).toContain("42");
    expect(email.text).toContain("2026-04-21T14:30:00.000Z");
    expect(email.text).toContain("Kurumsal egitimler");
  });

  it("renders fallback text for missing optional contact fields", () => {
    const email = buildInternalNotificationEmail({
      key: "contact_submission",
      payload: {
        submissionId: 7,
        fullName: "Ada Kaya",
        email: "ada@example.com",
        subject: "Bilgi talebi",
        phone: " ",
        company: null,
        message: "Merhaba",
        submittedAt: "2026-04-21T14:30:00.000Z",
      },
    });

    expect(email.text).toContain("Telefon: Belirtilmedi");
    expect(email.text).toContain("Sirket: Belirtilmedi");
  });

  it("renders the event registration notification in Turkish", () => {
    const email = buildInternalNotificationEmail({
      key: "event_registration",
      payload: {
        registrationId: 15,
        status: "pending",
        notes: "Sertifika talebi var",
        event: {
          documentId: "evt_123",
          title: "Demo Etkinlik",
          slug: "demo-etkinlik",
          startsAt: "2026-04-22T09:00:00.000Z",
          location: "Istanbul Campus",
        },
        student: {
          firstName: "Ada",
          email: "ada@example.com",
          phone: "+90 555 111 2233",
          tckn: "12345678901",
        },
      },
    });

    expect(email.subject).toContain("Etkinlik Kayit Bildirimi");
    expect(email.text).toContain("Demo Etkinlik");
    expect(email.text).toContain("ada@example.com");
    expect(email.text).toContain("Ada");
  });

  it("renders fallback text for missing optional event fields", () => {
    const email = buildInternalNotificationEmail({
      key: "event_registration",
      payload: {
        registrationId: 16,
        status: "pending",
        event: {
          documentId: "evt_124",
          title: "Demo Etkinlik 2",
          slug: "demo-etkinlik-2",
          startsAt: "2026-04-23T09:00:00.000Z",
          location: "",
        },
        student: {
          firstName: "Ada",
          lastName: " ",
          email: "ada@example.com",
          phone: null,
          tckn: "12345678901",
        },
        notes: undefined,
      },
    });

    expect(email.text).toContain("Ogrenci: Ada");
    expect(email.text).toContain("Telefon: Belirtilmedi");
    expect(email.text).toContain("Notlar: Belirtilmedi");
    expect(email.text).toContain("Konum: Belirtilmedi");
  });

  it("throws for unsupported notification keys", () => {
    expect(() =>
      buildInternalNotificationEmail({
        key: "unsupported_notification",
        payload: {},
      } as never),
    ).toThrow("Unsupported internal notification key: unsupported_notification");
  });
});

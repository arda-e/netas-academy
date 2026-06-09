import { describe, expect, it, vi } from "vitest";

import { deliverInternalNotificationViaStrapi } from "../../src/services/internal-notifications/strapi-service";
import type { InternalNotificationEnvelope } from "../../src/services/internal-notifications/types";

const eventRegistrationEnvelope: InternalNotificationEnvelope<"event_registration"> = {
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
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
      tckn: "12345678901",
    },
  },
};

function makeStrapi(emailSendFn: ReturnType<typeof vi.fn>) {
  return {
    db: {
      query: vi.fn().mockReturnValue({
        findOne: vi.fn().mockResolvedValue({
          key: "event_registration",
          label: "Etkinlik Kayit Bildirimi",
          enabled: true,
          customEmails: ["events@netas.com.tr"],
        }),
      }),
    },
    plugin: vi.fn().mockReturnValue({
      service: vi.fn().mockReturnValue({ send: emailSendFn }),
    }),
    log: { warn: vi.fn(), error: vi.fn() },
  };
}

describe("deliverInternalNotificationViaStrapi", () => {
  it("loads routing via db.query and sends email; returns sent result", async () => {
    const emailSendFn = vi.fn().mockResolvedValue(undefined);
    const strapi = makeStrapi(emailSendFn);

    const result = await deliverInternalNotificationViaStrapi(strapi as any, eventRegistrationEnvelope);

    expect(result).toMatchObject({
      status: "sent",
      key: "event_registration",
      recipients: ["events@netas.com.tr"],
    });
    expect(emailSendFn).toHaveBeenCalledWith(
      expect.objectContaining({ to: "events@netas.com.tr" }),
    );
  });

  it("returns send_failed and logs when email delivery throws", async () => {
    const emailSendFn = vi.fn().mockRejectedValue(new Error("SMTP timeout"));
    const strapi = makeStrapi(emailSendFn);

    const result = await deliverInternalNotificationViaStrapi(strapi as any, eventRegistrationEnvelope);

    expect(result).toMatchObject({
      status: "send_failed",
      key: "event_registration",
    });
    expect(strapi.log.error).toHaveBeenCalledWith(
      "Internal notification SMTP send failed",
      expect.objectContaining({ key: "event_registration", errMessage: "SMTP timeout" }),
    );
  });
});

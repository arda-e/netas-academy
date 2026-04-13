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

describe("deliverInternalNotificationViaStrapi", () => {
  it("queries routing with the expected shape and sends the mapped email payload", async () => {
    const findOne = vi.fn().mockResolvedValue({
      key: "event_registration",
      label: "Etkinlik Kayit Bildirimi",
      enabled: true,
      customEmails: ["events@netas.com.tr"],
      adminRoles: [
        {
          users: {
            data: [{ email: "ops@netas.com.tr" }],
          },
        },
      ],
    });
    const send = vi.fn().mockResolvedValue(undefined);
    const query = vi.fn().mockReturnValue({ findOne });
    const service = vi.fn().mockReturnValue({ send });
    const plugin = vi.fn().mockReturnValue({ service });
    const warn = vi.fn();
    const error = vi.fn();
    const strapi = {
      db: { query },
      plugin,
      log: { warn, error },
    } as any;

    await expect(deliverInternalNotificationViaStrapi(strapi, eventRegistrationEnvelope)).resolves.toEqual({
      status: "sent",
      key: "event_registration",
      recipients: ["events@netas.com.tr", "ops@netas.com.tr"],
    });

    expect(query).toHaveBeenCalledWith("api::notification-routing.notification-routing");
    expect(findOne).toHaveBeenCalledWith({
      where: { key: "event_registration" },
      select: ["key", "label", "enabled", "customEmails"],
      populate: {
        adminRoles: {
          populate: {
            users: {
              fields: ["email"],
            },
          },
        },
      },
    });
    expect(plugin).toHaveBeenCalledWith("email");
    expect(service).toHaveBeenCalledWith("email");
    expect(send).toHaveBeenCalledWith({
      to: ["events@netas.com.tr", "ops@netas.com.tr"],
      subject: "Etkinlik Kayit Bildirimi - Demo Etkinlik",
      text: expect.stringContaining("Yeni bir etkinlik kayit talebi olusturuldu."),
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});

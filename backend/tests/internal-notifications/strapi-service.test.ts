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
  it("delegates to the internal-notifications plugin service and returns structured result", async () => {
    const deliverFn = vi.fn().mockResolvedValue({
      status: "sent",
      key: "event_registration",
      recipients: ["events@netas.com.tr", "ops@netas.com.tr"],
    });

    const pluginServiceFn = vi.fn().mockReturnValue(deliverFn);
    const pluginFn = vi.fn().mockReturnValue({ service: pluginServiceFn });
    const warn = vi.fn();
    const error = vi.fn();
    const strapi = {
      plugin: pluginFn,
      log: { warn, error },
    } as any;

    await expect(
      deliverInternalNotificationViaStrapi(strapi, eventRegistrationEnvelope)
    ).resolves.toEqual({
      status: "sent",
      key: "event_registration",
      recipients: ["events@netas.com.tr", "ops@netas.com.tr"],
    });

    expect(pluginFn).toHaveBeenCalledWith("internal-notifications");
    expect(pluginServiceFn).toHaveBeenCalledWith("deliverInternalNotification");
    expect(deliverFn).toHaveBeenCalledWith(eventRegistrationEnvelope);
  });

  it("propagates errors from the plugin service", async () => {
    const deliverFn = vi.fn().mockRejectedValue(new Error("SMTP timeout"));
    const pluginServiceFn = vi.fn().mockReturnValue(deliverFn);
    const pluginFn = vi.fn().mockReturnValue({ service: pluginServiceFn });
    const warn = vi.fn();
    const error = vi.fn();
    const strapi = {
      plugin: pluginFn,
      log: { warn, error },
    } as any;

    await expect(
      deliverInternalNotificationViaStrapi(strapi, eventRegistrationEnvelope)
    ).rejects.toThrow("SMTP timeout");

    expect(pluginFn).toHaveBeenCalledWith("internal-notifications");
    expect(deliverFn).toHaveBeenCalledWith(eventRegistrationEnvelope);
  });
});

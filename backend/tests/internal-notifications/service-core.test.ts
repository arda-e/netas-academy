import { describe, expect, it, vi } from "vitest";

import { deliverInternalNotification } from "../../src/services/internal-notifications/service-core";
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

describe("deliverInternalNotification", () => {
  it("loads a routing record by key and sends to normalized deduped recipients", async () => {
    const loadRoutingByKey = vi.fn().mockResolvedValue({
      key: "event_registration",
      label: "Etkinlik Kayit Bildirimi",
      enabled: true,
      customEmails: [" Etkinlikler@Netas.com.tr ", "ops@netas.com.tr", "invalid"],
      adminRoles: [
        {
          code: "strapi-super-admin",
          users: [{ email: "OPS@netas.com.tr" }, { email: "" }],
        },
        {
          code: "editor",
          users: [{ email: "events@netas.com.tr" }, { email: null }],
        },
      ],
    });
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const warn = vi.fn();
    const error = vi.fn();

    await deliverInternalNotification({
      envelope: eventRegistrationEnvelope,
      loadRoutingByKey,
      sendEmail,
      warn,
      error,
    });

    expect(loadRoutingByKey).toHaveBeenCalledWith("event_registration");
    expect(sendEmail).toHaveBeenCalledWith({
      to: ["etkinlikler@netas.com.tr", "ops@netas.com.tr", "events@netas.com.tr"],
      subject: "Etkinlik Kayit Bildirimi - Demo Etkinlik",
      text: expect.stringContaining("Yeni bir etkinlik kayit talebi olusturuldu."),
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("warns and returns routing_not_found when no routing exists", async () => {
    const loadRoutingByKey = vi.fn().mockResolvedValue(null);
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const warn = vi.fn();
    const error = vi.fn();

    await expect(
      deliverInternalNotification({
        envelope: eventRegistrationEnvelope,
        loadRoutingByKey,
        sendEmail,
        warn,
        error,
      }),
    ).resolves.toEqual({
      status: "skipped",
      key: "event_registration",
      reason: "routing_not_found",
    });

    expect(sendEmail).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("Internal notification routing not found", {
      key: "event_registration",
    });
    expect(error).not.toHaveBeenCalled();
  });

  it("skips when routing is disabled", async () => {
    const loadRoutingByKey = vi.fn().mockResolvedValue({
      key: "event_registration",
      label: "Etkinlik Kayit Bildirimi",
      enabled: false,
      customEmails: ["events@netas.com.tr"],
      adminRoles: [],
    });
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const warn = vi.fn();
    const error = vi.fn();

    await deliverInternalNotification({
      envelope: eventRegistrationEnvelope,
      loadRoutingByKey,
      sendEmail,
      warn,
      error,
    });

    expect(sendEmail).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("skips and warns when no recipients are resolved", async () => {
    const loadRoutingByKey = vi.fn().mockResolvedValue({
      key: "event_registration",
      label: "Etkinlik Kayit Bildirimi",
      enabled: true,
      customEmails: [" ", "invalid"],
      adminRoles: [{ code: "editor", users: [{ email: null }] }],
    });
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const warn = vi.fn();
    const error = vi.fn();

    await deliverInternalNotification({
      envelope: eventRegistrationEnvelope,
      loadRoutingByKey,
      sendEmail,
      warn,
      error,
    });

    expect(sendEmail).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      "No recipients resolved for internal notification routing",
      expect.objectContaining({ key: "event_registration" }),
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("resolves role recipients from nested user collections", async () => {
    const loadRoutingByKey = vi.fn().mockResolvedValue({
      key: "event_registration",
      label: "Etkinlik Kayit Bildirimi",
      enabled: true,
      customEmails: [],
      adminRoles: [
        {
          code: "strapi-super-admin",
          users: {
            data: [{ email: "admins@netas.com.tr" }, { email: " ADMINS@netas.com.tr " }],
          },
        },
      ],
    });
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const warn = vi.fn();
    const error = vi.fn();

    await deliverInternalNotification({
      envelope: eventRegistrationEnvelope,
      loadRoutingByKey,
      sendEmail,
      warn,
      error,
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["admins@netas.com.tr"],
      }),
    );
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("logs and returns invalid_routing_data when populated role users shape is malformed", async () => {
    const loadRoutingByKey = vi.fn().mockResolvedValue({
      key: "event_registration",
      label: "Etkinlik Kayit Bildirimi",
      enabled: true,
      customEmails: [],
      adminRoles: [
        {
          code: "strapi-super-admin",
          users: {
            data: {
              email: "admins@netas.com.tr",
            },
          },
        },
      ],
    });
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    const warn = vi.fn();
    const error = vi.fn();

    await expect(
      deliverInternalNotification({
        envelope: eventRegistrationEnvelope,
        loadRoutingByKey,
        sendEmail,
        warn,
        error,
      }),
    ).resolves.toEqual({
      status: "invalid_routing_data",
      key: "event_registration",
    });

    expect(sendEmail).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Internal notification routing data is malformed",
      expect.objectContaining({
        key: "event_registration",
        label: "Etkinlik Kayit Bildirimi",
      }),
    );
  });

  it("logs and returns a structured send failure when email delivery rejects", async () => {
    const loadRoutingByKey = vi.fn().mockResolvedValue({
      key: "event_registration",
      label: "Etkinlik Kayit Bildirimi",
      enabled: true,
      customEmails: ["events@netas.com.tr"],
      adminRoles: [],
    });
    const sendError = new Error("SMTP timeout");
    const sendEmail = vi.fn().mockRejectedValue(sendError);
    const warn = vi.fn();
    const error = vi.fn();

    await expect(
      deliverInternalNotification({
        envelope: eventRegistrationEnvelope,
        loadRoutingByKey,
        sendEmail,
        warn,
        error,
      }),
    ).resolves.toEqual({
      status: "send_failed",
      key: "event_registration",
      recipients: ["events@netas.com.tr"],
    });

    expect(error).toHaveBeenCalledWith(
      "Internal notification delivery failed",
      expect.objectContaining({
        key: "event_registration",
        error: sendError,
      }),
    );
    expect(warn).not.toHaveBeenCalled();
  });
});

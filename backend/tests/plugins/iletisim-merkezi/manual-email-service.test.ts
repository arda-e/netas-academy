import { describe, it, expect, vi, afterEach } from "vitest";
import manualEmailServiceFactory from "../../../src/plugins/iletisim-merkezi/server/services/manual-email-service";

describe("manualEmailService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function makeContext({ event = undefined as unknown } = {}) {
    const emailSend = vi.fn().mockResolvedValue(undefined);
    const eventFindOne = vi.fn().mockResolvedValue(event);
    const registrationUpdate = vi.fn().mockResolvedValue({});
    const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const strapi = {
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::event.event") return { findOne: eventFindOne };
          if (uid === "api::registration.registration") return { update: registrationUpdate };
          throw new Error(`Unexpected uid: ${uid}`);
        }),
      },
      log,
    };

    const service = manualEmailServiceFactory({ strapi: strapi as never, emailSender: { send: emailSend } });
    return { service, emailSend, registrationUpdate, log };
  }

  function makeEvent(overrides: Record<string, unknown> = {}) {
    return {
      id: 1,
      documentId: "evt_abc",
      title: "React Workshop",
      slug: "react-workshop",
      startsAt: "2026-07-10T10:00:00.000Z",
      meetingLink: null,
      registrations: [
        { id: 10, registrationStatus: "confirmed", student: { id: 1, firstName: "Ada", email: "ada@example.com" } },
        { id: 11, registrationStatus: "confirmed", student: { id: 2, firstName: "Bora", email: "bora@example.com" } },
      ],
      ...overrides,
    };
  }

  describe("sendManualEmail", () => {
    it("sends to all confirmed registrants and updates lastEmailSentAt for each", async () => {
      const { service, emailSend, registrationUpdate } = makeContext({ event: makeEvent() });

      const result = await service.sendManualEmail("evt_abc", "Duyuru", "<p>Mesaj</p>");

      expect(emailSend).toHaveBeenCalledTimes(2);
      expect(emailSend).toHaveBeenCalledWith(expect.objectContaining({ to: "ada@example.com" }));
      expect(emailSend).toHaveBeenCalledWith(expect.objectContaining({ to: "bora@example.com" }));
      expect(registrationUpdate).toHaveBeenCalledTimes(2);
      expect(result.sentRecipients).toBe(2);
      expect(result.failedRecipients).toBe(0);
      expect(result.failedEmails).toBeUndefined();
    });

    it("appends meeting link to html when event has meetingLink", async () => {
      const { service, emailSend } = makeContext({
        event: makeEvent({ meetingLink: "https://zoom.us/j/999" }),
      });

      await service.sendManualEmail("evt_abc", "Duyuru", "<p>Mesaj</p>");

      const html: string = emailSend.mock.calls[0][0].html;
      expect(html).toContain("https://zoom.us/j/999");
    });

    it("deduplicates by email and counts skipped", async () => {
      const event = makeEvent({
        registrations: [
          { id: 10, registrationStatus: "confirmed", student: { id: 1, email: "ada@example.com" } },
          { id: 11, registrationStatus: "confirmed", student: { id: 2, email: "ADA@EXAMPLE.COM" } },
        ],
      });
      const { service, emailSend, registrationUpdate } = makeContext({ event });

      const result = await service.sendManualEmail("evt_abc", "Duyuru", "<p>Mesaj</p>");

      expect(emailSend).toHaveBeenCalledTimes(1);
      expect(registrationUpdate).toHaveBeenCalledTimes(1);
      expect(result.sentRecipients).toBe(1);
      expect(result.skippedRecipients).toBe(1);
    });

    it("excludes pending registrations when no status filter is provided", async () => {
      const event = makeEvent({
        registrations: [
          { id: 10, registrationStatus: "confirmed", student: { id: 1, email: "ada@example.com" } },
          { id: 11, registrationStatus: "pending", student: { id: 2, email: "bora@example.com" } },
        ],
      });
      const { service, emailSend } = makeContext({ event });

      const result = await service.sendManualEmail("evt_abc", "Duyuru", "<p>Mesaj</p>");

      expect(emailSend).toHaveBeenCalledTimes(1);
      expect(emailSend).toHaveBeenCalledWith(expect.objectContaining({ to: "ada@example.com" }));
      expect(result.sentRecipients).toBe(1);
    });

    it("includes pending registrations when custom status filter contains pending", async () => {
      const event = makeEvent({
        registrations: [
          { id: 10, registrationStatus: "confirmed", student: { id: 1, email: "ada@example.com" } },
          { id: 11, registrationStatus: "pending", student: { id: 2, email: "bora@example.com" } },
        ],
      });
      const { service, emailSend } = makeContext({ event });

      const result = await service.sendManualEmail("evt_abc", "Duyuru", "<p>Mesaj</p>", ["confirmed", "pending"]);

      expect(emailSend).toHaveBeenCalledTimes(2);
      expect(result.sentRecipients).toBe(2);
    });

    it("continues sending to other recipients when one send fails, logs error, omits failed from db update", async () => {
      const event = makeEvent();
      const { service, emailSend, registrationUpdate, log } = makeContext({ event });
      emailSend.mockRejectedValueOnce(new Error("SMTP fail")).mockResolvedValueOnce(undefined);

      const result = await service.sendManualEmail("evt_abc", "Duyuru", "<p>Mesaj</p>");

      expect(emailSend).toHaveBeenCalledTimes(2);
      expect(registrationUpdate).toHaveBeenCalledTimes(1);
      expect(result.failedRecipients).toBe(1);
      expect(result.failedEmails).toHaveLength(1);
      expect(log.error).toHaveBeenCalled();
    });

    it("throws when event is not found", async () => {
      const { service } = makeContext({ event: null });

      await expect(
        service.sendManualEmail("evt_missing", "Duyuru", "<p>Mesaj</p>"),
      ).rejects.toThrow("Event not found");
    });

    it("throws when no registrations match the filter", async () => {
      const event = makeEvent({ registrations: [] });
      const { service } = makeContext({ event });

      await expect(
        service.sendManualEmail("evt_abc", "Duyuru", "<p>Mesaj</p>"),
      ).rejects.toThrow("No matching registrations");
    });
  });

  describe("sendTestEmail", () => {
    it("sends to admin email with [TEST] subject prefix and returns summary without db update", async () => {
      const event = {
        id: 1,
        documentId: "evt_abc",
        title: "React Workshop",
        startsAt: "2026-07-10T10:00:00.000Z",
        meetingLink: null,
      };
      const { service, emailSend, registrationUpdate } = makeContext({ event });

      const result = await service.sendTestEmail("evt_abc", "Duyuru", "<p>Mesaj</p>", "admin@netas.com");

      expect(emailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "admin@netas.com",
          subject: expect.stringContaining("[TEST]"),
        }),
      );
      expect(registrationUpdate).not.toHaveBeenCalled();
      expect(result.sentTo).toBe("admin@netas.com");
      expect(result.sentAt).toEqual(expect.any(String));
    });

    it("appends meeting link to html when event has meetingLink", async () => {
      const event = {
        id: 1,
        documentId: "evt_abc",
        title: "React Workshop",
        startsAt: "2026-07-10T10:00:00.000Z",
        meetingLink: "https://zoom.us/j/999",
      };
      const { service, emailSend } = makeContext({ event });

      await service.sendTestEmail("evt_abc", "Duyuru", "<p>Mesaj</p>", "admin@netas.com");

      const html: string = emailSend.mock.calls[0][0].html;
      expect(html).toContain("https://zoom.us/j/999");
    });

    it("throws when event is not found", async () => {
      const { service } = makeContext({ event: null });

      await expect(
        service.sendTestEmail("evt_missing", "Duyuru", "<p>Mesaj</p>", "admin@netas.com"),
      ).rejects.toThrow("Event not found");
    });
  });
});

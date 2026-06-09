import { describe, it, expect, vi, afterEach } from "vitest";
import confirmationServiceFactory from "../../../src/plugins/iletisim-merkezi/server/services/confirmation-service";

const TEMPLATE_UID = "plugin::iletisim-merkezi.confirmation-template";
const REGISTRATION_UID = "api::registration.registration";

describe("confirmationService.sendAutoConfirmation", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function makeContext({
    registration = undefined as unknown,
    template = undefined as unknown,
  } = {}) {
    const emailSend = vi.fn().mockResolvedValue(undefined);
    const registrationFindOne = vi.fn().mockResolvedValue(registration);
    const registrationUpdate = vi.fn().mockResolvedValue({});
    const templateFindOne = vi.fn().mockResolvedValue(template);
    const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const strapi = {
      db: {
        query: vi.fn((uid: string) => {
          if (uid === REGISTRATION_UID) return { findOne: registrationFindOne, update: registrationUpdate };
          if (uid === TEMPLATE_UID) return { findOne: templateFindOne };
          throw new Error(`Unexpected uid: ${uid}`);
        }),
      },
      log,
    };

    const service = confirmationServiceFactory({ strapi: strapi as never, emailSender: { send: emailSend } });
    return { service, strapi, emailSend, registrationUpdate, log };
  }

  const baseEvent = {
    id: 1,
    documentId: "evt_abc",
    title: "Siber Güvenlik Webinar",
    startsAt: "2026-06-20T10:00:00.000Z",
    location: "Online",
    meetingLink: null,
    autoConfirmationEnabled: true,
  };
  const baseStudent = { id: 5, firstName: "Ada", lastName: "Kaya", email: "ada@example.com" };
  const baseRegistration = { id: 42, status: "confirmed", event: baseEvent, student: baseStudent };
  const baseTemplate = {
    htmlBody: "<p>{{ event.title }} etkinliğine kaydınız onaylandı.</p>",
    enabled: true,
  };

  it("sends email and updates lastEmailSentAt on happy path", async () => {
    const { service, emailSend, registrationUpdate, log } = makeContext({
      registration: baseRegistration,
      template: baseTemplate,
    });

    await service.sendAutoConfirmation(42);

    expect(emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.com",
        subject: expect.stringContaining("Siber Güvenlik Webinar"),
        html: expect.stringContaining("Siber Güvenlik Webinar"),
      }),
    );
    expect(emailSend.mock.calls[0][0].html).not.toContain("{{ event.title }}");
    expect(registrationUpdate).toHaveBeenCalledWith({
      where: { id: 42 },
      data: expect.objectContaining({ lastEmailSentAt: expect.any(String) }),
    });
    expect(log.info).toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
  });

  it("skips without error when autoConfirmationEnabled is false", async () => {
    const { service, emailSend, registrationUpdate, log } = makeContext({
      registration: { ...baseRegistration, event: { ...baseEvent, autoConfirmationEnabled: false } },
      template: baseTemplate,
    });

    await service.sendAutoConfirmation(42);

    expect(emailSend).not.toHaveBeenCalled();
    expect(registrationUpdate).not.toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
  });

  it("warns and skips when template is disabled", async () => {
    const { service, emailSend, log } = makeContext({
      registration: baseRegistration,
      template: { ...baseTemplate, enabled: false },
    });

    await service.sendAutoConfirmation(42);

    expect(emailSend).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalled();
  });

  it("warns and skips when registration is not found", async () => {
    const { service, emailSend, log } = makeContext({ registration: null });

    await service.sendAutoConfirmation(99);

    expect(emailSend).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalled();
  });

  it("warns and skips when student has no email", async () => {
    const { service, emailSend, log } = makeContext({
      registration: { ...baseRegistration, student: { ...baseStudent, email: null } },
      template: baseTemplate,
    });

    await service.sendAutoConfirmation(42);

    expect(emailSend).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalled();
  });

  it("resolves without throwing when email send fails, logs error, and skips db update", async () => {
    const { service, emailSend, registrationUpdate, log } = makeContext({
      registration: baseRegistration,
      template: baseTemplate,
    });
    emailSend.mockRejectedValue(new Error("SMTP timeout"));

    await expect(service.sendAutoConfirmation(42)).resolves.toBeUndefined();

    expect(log.error).toHaveBeenCalled();
    expect(registrationUpdate).not.toHaveBeenCalled();
  });

  it("replaces all template variables in the html body", async () => {
    const htmlBody =
      "<p>{{ event.title }} | {{ event.startsAt }} | {{ event.location }} | {{ event.meetingLink }}</p>";
    const { service, emailSend } = makeContext({
      registration: {
        ...baseRegistration,
        event: { ...baseEvent, location: "Istanbul", meetingLink: "https://zoom.us/j/999" },
      },
      template: { htmlBody, enabled: true },
    });

    await service.sendAutoConfirmation(42);

    const html: string = emailSend.mock.calls[0][0].html;
    expect(html).not.toContain("{{ event.title }}");
    expect(html).not.toContain("{{ event.startsAt }}");
    expect(html).not.toContain("{{ event.location }}");
    expect(html).not.toContain("{{ event.meetingLink }}");
    expect(html).toContain("Siber Güvenlik Webinar");
    expect(html).toContain("Istanbul");
    expect(html).toContain("https://zoom.us/j/999");
  });
});

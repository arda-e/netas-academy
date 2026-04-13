import { afterEach, describe, expect, it, vi } from "vitest";

import type { InternalNotificationEnvelope } from "../../../src/services/internal-notifications/types";

const deliverInternalNotificationViaStrapi = vi.fn();

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (_uid: string, factory: () => unknown) => factory(),
  },
}));

vi.mock("@strapi/utils", () => ({
  errors: {
    ValidationError: class ValidationError extends Error {},
  },
}));

vi.mock("../../../src/services/internal-notifications/strapi-service", () => ({
  deliverInternalNotificationViaStrapi,
}));

describe("contact-submission service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("persists first, then triggers contact routing without failing when notification delivery rejects", async () => {
    const events: string[] = [];
    const createdSubmission = {
      id: 42,
      firstName: "Ada",
      lastName: "Kaya",
      fullName: "Ada Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
      company: "Netas",
      subject: "Bilgi Talebi",
      message: "Merhaba",
      submittedAt: "2026-04-12T10:00:00.000Z",
      status: "new",
    };
    const create = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
      events.push(`create:${String("recipientEmails" in data)}`);
      return createdSubmission;
    });
    const strapi = {
      db: {
        query: vi.fn().mockReturnValue({ create }),
      },
      log: {
        error: vi.fn(),
      },
    };

    deliverInternalNotificationViaStrapi.mockImplementation(async () => {
      events.push("notify");
      throw new Error("SMTP timeout");
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/contact-submission/services/contact-submission");
    const service = serviceModule.default as {
      createSubmission: (input: Record<string, string>) => Promise<typeof createdSubmission>;
    };

    await expect(
      service.createSubmission({
        firstName: " Ada ",
        lastName: " Kaya ",
        email: " ADA@EXAMPLE.COM ",
        phone: " +90 555 111 2233 ",
        company: " Netas ",
        subject: " Bilgi Talebi ",
        message: " Merhaba ",
      }),
    ).resolves.toEqual(createdSubmission);

    const expectedEnvelope: InternalNotificationEnvelope<"contact_submission"> = {
      key: "contact_submission",
      payload: {
        submissionId: 42,
        fullName: "Ada Kaya",
        email: "ada@example.com",
        phone: "+90 555 111 2233",
        company: "Netas",
        subject: "Bilgi Talebi",
        message: "Merhaba",
        submittedAt: "2026-04-12T10:00:00.000Z",
      },
    };

    expect(create).toHaveBeenCalledWith({
      data: {
        firstName: "Ada",
        lastName: "Kaya",
        fullName: "Ada Kaya",
        email: "ada@example.com",
        phone: "+90 555 111 2233",
        company: "Netas",
        subject: "Bilgi Talebi",
        message: "Merhaba",
        submittedAt: expect.any(String),
        status: "new",
      },
    });
    expect(deliverInternalNotificationViaStrapi).toHaveBeenCalledWith(strapi, expectedEnvelope);
    expect(strapi.log.error).toHaveBeenCalledWith(
      "Contact submission notification delivery failed",
      expect.objectContaining({
        submissionId: 42,
        error: expect.any(Error),
      }),
    );
    expect(events).toEqual(["create:false", "notify"]);
  });
});

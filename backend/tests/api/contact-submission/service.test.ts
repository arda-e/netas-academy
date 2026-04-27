import { afterEach, describe, expect, it, vi } from "vitest";

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

  function createStrapiMock(createResult: Record<string, unknown>) {
    const create = vi.fn().mockResolvedValue(createResult);
    return {
      db: {
        query: vi.fn().mockReturnValue({ create }),
      },
      log: {
        error: vi.fn(),
      },
      create,
    };
  }

  it("persists a corporate training lead with interestTopic and status=new", async () => {
    const submission = {
      id: 1,
      leadType: "corporate_training_request",
      fullName: "Ada Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
      company: "Netas",
      message: "Kurumsal egitim hakkinda bilgi almak istiyorum.",
      interestTopic: "Veri Bilimi",
      expertiseAreas: null,
      companySize: null,
      partnershipDetails: null,
      submittedAt: "2026-04-27T10:00:00.000Z",
      status: "new",
    };
    const strapi = createStrapiMock(submission);
    deliverInternalNotificationViaStrapi.mockResolvedValue(undefined);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/contact-submission/services/contact-submission");
    const service = serviceModule.default as {
      createSubmission: (input: Record<string, string>) => Promise<typeof submission>;
    };

    await expect(
      service.createSubmission({
        leadType: "corporate_training_request",
        fullName: " Ada Kaya ",
        email: " ADA@EXAMPLE.COM ",
        phone: " +90 555 111 2233 ",
        company: " Netas ",
        message: " Kurumsal egitim hakkinda bilgi almak istiyorum. ",
        interestTopic: " Veri Bilimi ",
      }),
    ).resolves.toEqual(submission);

    expect(strapi.create).toHaveBeenCalledWith({
      data: {
        leadType: "corporate_training_request",
        fullName: "Ada Kaya",
        email: "ada@example.com",
        phone: "+90 555 111 2233",
        company: "Netas",
        message: "Kurumsal egitim hakkinda bilgi almak istiyorum.",
        interestTopic: "Veri Bilimi",
        expertiseAreas: null,
        companySize: null,
        partnershipDetails: null,
        submittedAt: expect.any(String),
        status: "new",
      },
    });

    expect(deliverInternalNotificationViaStrapi).toHaveBeenCalledWith(
      strapi,
      expect.objectContaining({
        key: "lead_corporate_training",
        payload: expect.objectContaining({
          submissionId: 1,
          fullName: "Ada Kaya",
          interestTopic: "Veri Bilimi",
        }),
      }),
    );
  });

  it("persists an instructor lead with expertiseAreas and routes to instructor key", async () => {
    const submission = {
      id: 2,
      leadType: "instructor_application",
      fullName: "Mehmet Yilmaz",
      email: "mehmet@example.com",
      phone: "+90 555 222 3344",
      company: null,
      message: "Egitmen olmak istiyorum.",
      interestTopic: null,
      expertiseAreas: "Python, Makine Ogrenmesi",
      companySize: null,
      partnershipDetails: null,
      submittedAt: "2026-04-27T11:00:00.000Z",
      status: "new",
    };
    const strapi = createStrapiMock(submission);
    deliverInternalNotificationViaStrapi.mockResolvedValue(undefined);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/contact-submission/services/contact-submission");
    const service = serviceModule.default as {
      createSubmission: (input: Record<string, string>) => Promise<typeof submission>;
    };

    await expect(
      service.createSubmission({
        leadType: "instructor_application",
        fullName: "Mehmet Yilmaz",
        email: "mehmet@example.com",
        phone: "+90 555 222 3344",
        message: "Egitmen olmak istiyorum.",
        expertiseAreas: "Python, Makine Ogrenmesi",
      }),
    ).resolves.toEqual(submission);

    expect(deliverInternalNotificationViaStrapi).toHaveBeenCalledWith(
      strapi,
      expect.objectContaining({
        key: "lead_instructor_application",
        payload: expect.objectContaining({
          expertiseAreas: "Python, Makine Ogrenmesi",
        }),
      }),
    );
  });

  it("normalizes whitespace in fullName, email, and message before persistence", async () => {
    const submission = {
      id: 3,
      leadType: "general_contact",
      fullName: "Zeynep   Demir",
      email: "zeynep@example.com",
      phone: "+90 555 333 4455",
      company: null,
      message: "Merhaba\n\n\nNasilsiniz?",
      interestTopic: null,
      expertiseAreas: null,
      companySize: null,
      partnershipDetails: null,
      submittedAt: "2026-04-27T12:00:00.000Z",
      status: "new",
    };
    const strapi = createStrapiMock(submission);
    deliverInternalNotificationViaStrapi.mockResolvedValue(undefined);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/contact-submission/services/contact-submission");
    const service = serviceModule.default as {
      createSubmission: (input: Record<string, string>) => Promise<typeof submission>;
    };

    await service.createSubmission({
      leadType: "general_contact",
      fullName: "  Zeynep   Demir  ",
      email: "  ZEYNEP@EXAMPLE.COM  ",
      phone: " +90 555 333 4455 ",
      message: "  Merhaba\n\n\nNasilsiniz?  ",
    });

    expect(strapi.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fullName: "Zeynep Demir",
        email: "zeynep@example.com",
        message: "Merhaba\n\nNasilsiniz?",
      }),
    });
  });

  it("rejects corporate training lead without interestTopic", async () => {
    const strapi = createStrapiMock({});
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/contact-submission/services/contact-submission");
    const service = serviceModule.default as {
      createSubmission: (input: Record<string, string>) => Promise<unknown>;
    };

    await expect(
      service.createSubmission({
        leadType: "corporate_training_request",
        fullName: "Ada Kaya",
        email: "ada@example.com",
        phone: "+90 555 111 2233",
        message: "Merhaba",
      }),
    ).rejects.toThrow("interestTopic is required for corporate training requests");
  });

  it("rejects instructor application without expertiseAreas", async () => {
    const strapi = createStrapiMock({});
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/contact-submission/services/contact-submission");
    const service = serviceModule.default as {
      createSubmission: (input: Record<string, string>) => Promise<unknown>;
    };

    await expect(
      service.createSubmission({
        leadType: "instructor_application",
        fullName: "Ada Kaya",
        email: "ada@example.com",
        phone: "+90 555 111 2233",
        message: "Merhaba",
      }),
    ).rejects.toThrow("expertiseAreas is required for instructor applications");
  });

  it("rejects solution partner application without companySize", async () => {
    const strapi = createStrapiMock({});
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/contact-submission/services/contact-submission");
    const service = serviceModule.default as {
      createSubmission: (input: Record<string, string>) => Promise<unknown>;
    };

    await expect(
      service.createSubmission({
        leadType: "solution_partner_application",
        fullName: "Ada Kaya",
        email: "ada@example.com",
        phone: "+90 555 111 2233",
        message: "Merhaba",
      }),
    ).rejects.toThrow("companySize is required for solution partner applications");
  });

  it("logs notification delivery error but does not fail lead persistence", async () => {
    const submission = {
      id: 4,
      leadType: "general_contact",
      fullName: "Ada Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
      company: null,
      message: "Merhaba",
      interestTopic: null,
      expertiseAreas: null,
      companySize: null,
      partnershipDetails: null,
      submittedAt: "2026-04-27T10:00:00.000Z",
      status: "new",
    };
    const strapi = createStrapiMock(submission);
    deliverInternalNotificationViaStrapi.mockRejectedValue(new Error("SMTP timeout"));
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/contact-submission/services/contact-submission");
    const service = serviceModule.default as {
      createSubmission: (input: Record<string, string>) => Promise<typeof submission>;
    };

    const result = await service.createSubmission({
      leadType: "general_contact",
      fullName: "Ada Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
      message: "Merhaba",
    });

    expect(result).toEqual(submission);
    expect(strapi.log.error).toHaveBeenCalledWith(
      "Contact submission notification delivery failed",
      expect.objectContaining({
        submissionId: 4,
        error: expect.any(Error),
      }),
    );
  });
});

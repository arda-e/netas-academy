import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("newsletter-subscription service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  function createStrapiMock(findOneResult: Record<string, unknown> | null, createResult?: Record<string, unknown>) {
    const findOne = vi.fn().mockResolvedValue(findOneResult);
    const create = vi.fn().mockResolvedValue(createResult ?? { id: 1 });
    const update = vi.fn().mockResolvedValue({ id: 1 });
    const sendEmail = vi.fn().mockResolvedValue(undefined);
    return {
      db: {
        query: vi.fn().mockReturnValue({ findOne, create, update }),
      },
      plugin: vi.fn().mockReturnValue({
        service: vi.fn().mockReturnValue({ send: sendEmail }),
      }),
      log: {
        error: vi.fn(),
      },
      findOne,
      create,
      update,
      sendEmail,
    };
  }

  it("creates a new subscription with normalized email", async () => {
    const strapi = createStrapiMock(null);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/newsletter-subscription/services/newsletter-subscription"
    );
    const service = serviceModule.default as {
      subscribe: (input: Record<string, unknown>) => Promise<unknown>;
    };

    const result = await service.subscribe({
      email: "  ADA@EXAMPLE.COM  ",
      consentAccepted: true,
      sourcePage: "/blog",
    });

    expect(result).toEqual({
      success: true,
      message: "Aboneliginiz basariyla olusturuldu.",
      alreadySubscribed: false,
    });

    expect(strapi.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "ada@example.com",
        consentAccepted: true,
        status: "active",
        sourcePage: "/blog",
        subscribedAt: expect.any(String),
        lastSeenAt: expect.any(String),
      }),
    });

    expect(strapi.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.com",
        subject: expect.stringContaining("E-bulten aboneliginiz"),
        text: expect.stringContaining("Aboneliginiz basariyla alindi"),
        html: expect.stringContaining("Aboneliginiz basariyla alindi"),
      }),
    );
  });

  it("refreshes lastSeenAt and source for existing active subscription", async () => {
    const existing = { id: 5, documentId: "doc5", status: "active" };
    const strapi = createStrapiMock(existing);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/newsletter-subscription/services/newsletter-subscription"
    );
    const service = serviceModule.default as {
      subscribe: (input: Record<string, unknown>) => Promise<unknown>;
    };

    const result = await service.subscribe({
      email: "ada@example.com",
      consentAccepted: true,
      sourcePage: "/egitimler",
    });

    expect(result).toEqual({
      success: true,
      message: "Bu e-posta adresi zaten kayitli.",
      alreadySubscribed: true,
    });

    expect(strapi.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: expect.objectContaining({
        lastSeenAt: expect.any(String),
        sourcePage: "/egitimler",
      }),
    });

    expect(strapi.create).not.toHaveBeenCalled();
    expect(strapi.sendEmail).not.toHaveBeenCalled();
  });

  it("reactivates passive subscription", async () => {
    const existing = { id: 7, documentId: "doc7", status: "passive" };
    const strapi = createStrapiMock(existing);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/newsletter-subscription/services/newsletter-subscription"
    );
    const service = serviceModule.default as {
      subscribe: (input: Record<string, unknown>) => Promise<unknown>;
    };

    const result = await service.subscribe({
      email: "passive@example.com",
      consentAccepted: true,
    });

    expect(result).toEqual({
      success: true,
      message: "Aboneliginiz basariyla yeniden aktiflestirildi.",
      alreadySubscribed: false,
    });

    expect(strapi.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: expect.objectContaining({
        status: "active",
        lastSeenAt: expect.any(String),
      }),
    });

    expect(strapi.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "passive@example.com",
        subject: expect.stringContaining("E-bulten aboneliginiz"),
      }),
    );
  });

  it("reactivates unsubscribed subscription", async () => {
    const existing = { id: 8, documentId: "doc8", status: "unsubscribed" };
    const strapi = createStrapiMock(existing);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/newsletter-subscription/services/newsletter-subscription"
    );
    const service = serviceModule.default as {
      subscribe: (input: Record<string, unknown>) => Promise<unknown>;
    };

    const result = await service.subscribe({
      email: "unsubscribed@example.com",
      consentAccepted: true,
    });

    expect(result).toEqual({
      success: true,
      message: "Aboneliginiz basariyla yeniden aktiflestirildi.",
      alreadySubscribed: false,
    });

    expect(strapi.update).toHaveBeenCalledWith({
      where: { id: 8 },
      data: expect.objectContaining({
        status: "active",
        lastSeenAt: expect.any(String),
      }),
    });
  });

  it("rejects missing email", async () => {
    const strapi = createStrapiMock(null);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/newsletter-subscription/services/newsletter-subscription"
    );
    const service = serviceModule.default as {
      subscribe: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await expect(
      service.subscribe({
        email: "",
        consentAccepted: true,
      }),
    ).rejects.toThrow("email is required");
  });

  it("rejects invalid email format", async () => {
    const strapi = createStrapiMock(null);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/newsletter-subscription/services/newsletter-subscription"
    );
    const service = serviceModule.default as {
      subscribe: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await expect(
      service.subscribe({
        email: "not-an-email",
        consentAccepted: true,
      }),
    ).rejects.toThrow("email must be a valid email address");
  });

  it("rejects missing consent", async () => {
    const strapi = createStrapiMock(null);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/newsletter-subscription/services/newsletter-subscription"
    );
    const service = serviceModule.default as {
      subscribe: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await expect(
      service.subscribe({
        email: "ada@example.com",
        consentAccepted: false,
      }),
    ).rejects.toThrow("consentAccepted must be true");
  });

  it("keeps subscription successful when confirmation email delivery fails", async () => {
    const strapi = createStrapiMock(null);
    strapi.sendEmail.mockRejectedValueOnce(new Error("SMTP rejected"));
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/newsletter-subscription/services/newsletter-subscription"
    );
    const service = serviceModule.default as {
      subscribe: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await expect(
      service.subscribe({
        email: "ada@example.com",
        consentAccepted: true,
      }),
    ).resolves.toEqual({
      success: true,
      message: "Aboneliginiz basariyla olusturuldu.",
      alreadySubscribed: false,
    });

    expect(strapi.log.error).toHaveBeenCalledWith(
      "Newsletter confirmation email delivery failed",
      expect.objectContaining({
        error: expect.any(Error),
      }),
    );
  });
});

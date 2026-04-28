import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreController: (_uid: string, factory: () => unknown) => factory(),
  },
}));

vi.mock("@strapi/utils", () => ({
  errors: {
    ValidationError: class ValidationError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "ValidationError";
      }
    },
  },
}));

describe("newsletter-subscription controller", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("calls service.subscribe with valid input", async () => {
    const subscribe = vi.fn().mockResolvedValue({
      success: true,
      message: "Aboneliginiz basariyla olusturuldu.",
      alreadySubscribed: false,
    });

    const strapi = {
      service: vi.fn().mockReturnValue({ subscribe }),
    };
    vi.stubGlobal("strapi", strapi);

    const controllerModule = await import(
      "../../../src/api/newsletter-subscription/controllers/newsletter-subscription"
    );
    const controller = controllerModule.default as {
      subscribe: (ctx: Record<string, unknown>) => Promise<void>;
    };

    const ctx = {
      request: {
        body: {
          email: "ada@example.com",
          consentAccepted: true,
          sourcePage: "/blog",
        },
      },
      body: null as unknown,
    };

    await controller.subscribe(ctx as any);

    expect(subscribe).toHaveBeenCalledWith({
      email: "ada@example.com",
      consentAccepted: true,
      sourcePage: "/blog",
    });

    expect(ctx.body).toEqual({
      data: {
        success: true,
        message: "Aboneliginiz basariyla olusturuldu.",
        alreadySubscribed: false,
      },
    });
  });

  it("rejects missing email with 400", async () => {
    const strapi = {
      service: vi.fn(),
    };
    vi.stubGlobal("strapi", strapi);

    const controllerModule = await import(
      "../../../src/api/newsletter-subscription/controllers/newsletter-subscription"
    );
    const controller = controllerModule.default as {
      subscribe: (ctx: Record<string, unknown>) => Promise<void>;
    };

    const ctx = {
      request: {
        body: {
          consentAccepted: true,
        },
      },
      body: null as unknown,
    };

    await expect(controller.subscribe(ctx as any)).rejects.toThrow("email is required");
  });

  it("rejects missing consent with 400", async () => {
    const strapi = {
      service: vi.fn(),
    };
    vi.stubGlobal("strapi", strapi);

    const controllerModule = await import(
      "../../../src/api/newsletter-subscription/controllers/newsletter-subscription"
    );
    const controller = controllerModule.default as {
      subscribe: (ctx: Record<string, unknown>) => Promise<void>;
    };

    const ctx = {
      request: {
        body: {
          email: "ada@example.com",
          consentAccepted: false,
        },
      },
      body: null as unknown,
    };

    await expect(controller.subscribe(ctx as any)).rejects.toThrow("consentAccepted must be true");
  });
});

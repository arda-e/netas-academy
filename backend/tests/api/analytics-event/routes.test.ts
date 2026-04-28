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

describe("analytics-event controller", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("calls service.capture with valid eventId", async () => {
    const capture = vi.fn().mockResolvedValue({
      success: true,
      message: "Event captured.",
      eventId: 1,
    });

    const strapi = {
      service: vi.fn().mockReturnValue({ capture }),
    };
    vi.stubGlobal("strapi", strapi);

    const controllerModule = await import(
      "../../../src/api/analytics-event/controllers/analytics-event"
    );
    const controller = controllerModule.default as {
      capture: (ctx: Record<string, unknown>) => Promise<void>;
    };

    const ctx = {
      request: {
        body: {
          eventId: "lead_tab_view",
          sessionId: "sess-123",
          pagePath: "/egitimler",
        },
      },
      body: null as unknown,
    };

    await controller.capture(ctx as any);

    expect(capture).toHaveBeenCalledWith({
      eventId: "lead_tab_view",
      sessionId: "sess-123",
      pagePath: "/egitimler",
    });

    expect(ctx.body).toEqual({
      data: {
        success: true,
        message: "Event captured.",
        eventId: 1,
      },
    });
  });

  it("rejects missing eventId", async () => {
    const strapi = {
      service: vi.fn(),
    };
    vi.stubGlobal("strapi", strapi);

    const controllerModule = await import(
      "../../../src/api/analytics-event/controllers/analytics-event"
    );
    const controller = controllerModule.default as {
      capture: (ctx: Record<string, unknown>) => Promise<void>;
    };

    const ctx = {
      request: {
        body: {},
      },
      body: null as unknown,
    };

    await expect(controller.capture(ctx as any)).rejects.toThrow("eventId is required");
  });

  it("rejects unknown eventId", async () => {
    const strapi = {
      service: vi.fn(),
    };
    vi.stubGlobal("strapi", strapi);

    const controllerModule = await import(
      "../../../src/api/analytics-event/controllers/analytics-event"
    );
    const controller = controllerModule.default as {
      capture: (ctx: Record<string, unknown>) => Promise<void>;
    };

    const ctx = {
      request: {
        body: {
          eventId: "bogus_event",
        },
      },
      body: null as unknown,
    };

    await expect(controller.capture(ctx as any)).rejects.toThrow(
      "eventId must be one of:"
    );
  });
});

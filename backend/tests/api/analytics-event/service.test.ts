import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (_uid: string, factory: () => unknown) => factory(),
  },
}));

describe("analytics-event service", () => {
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
      create,
    };
  }

  it("persists a valid analytics event", async () => {
    const created = {
      id: 1,
      eventId: "lead_tab_view",
      timestamp: "2026-04-28T12:00:00.000Z",
      sessionId: "sess-123",
      pagePath: "/egitimler",
      properties: {},
    };
    const strapi = createStrapiMock(created);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/analytics-event/services/analytics-event"
    );
    const service = serviceModule.default as {
      capture: (input: Record<string, unknown>) => Promise<unknown>;
    };

    const result = await service.capture({
      eventId: "lead_tab_view",
      sessionId: "sess-123",
      pagePath: "/egitimler",
    });

    expect(result).toEqual({
      success: true,
      message: "Event captured.",
      eventId: 1,
    });

    expect(strapi.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventId: "lead_tab_view",
        sessionId: "sess-123",
        pagePath: "/egitimler",
        timestamp: expect.any(String),
      }),
    });
  });

  it("strips PII-like keys from properties", async () => {
    const created = {
      id: 2,
      eventId: "lead_form_start",
      properties: { leadType: "corporate_training" },
    };
    const strapi = createStrapiMock(created);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/analytics-event/services/analytics-event"
    );
    const service = serviceModule.default as {
      capture: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await service.capture({
      eventId: "lead_form_start",
      properties: {
        leadType: "corporate_training",
        user_email: "ada@example.com",
        phone_number: "+90 555",
        full_name: "Ada Kaya",
        tckn: "12345678901",
        address: "Istanbul",
        password: "secret123",
      },
    });

    expect(strapi.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        properties: {
          leadType: "corporate_training",
        },
      }),
    });
  });

  it("handles null properties gracefully", async () => {
    const created = {
      id: 3,
      eventId: "lead_submit_success",
      properties: {},
    };
    const strapi = createStrapiMock(created);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/analytics-event/services/analytics-event"
    );
    const service = serviceModule.default as {
      capture: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await service.capture({
      eventId: "lead_submit_success",
      properties: null,
    });

    expect(strapi.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        properties: {},
      }),
    });
  });
});

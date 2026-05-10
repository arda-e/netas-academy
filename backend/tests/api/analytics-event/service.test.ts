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

  function createStrapiMock(
    createResult: Record<string, unknown>,
    deleteManyResolution: unknown = { count: 0 },
  ) {
    const create = vi.fn().mockResolvedValue(createResult);
    const deleteMany = vi.fn().mockResolvedValue(deleteManyResolution);
    return {
      db: {
        query: vi.fn().mockReturnValue({ create, deleteMany }),
      },
      log: { warn: vi.fn() },
      create,
      deleteMany,
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

  it("deletes events older than 30 days on capture", async () => {
    const created = { id: 4, eventId: "lead_tab_view" };
    const strapi = createStrapiMock(created);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/analytics-event/services/analytics-event"
    );
    const service = serviceModule.default as {
      capture: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await service.capture({ eventId: "lead_tab_view" });

    expect(strapi.deleteMany).toHaveBeenCalledWith({
      filters: {
        createdAt: { $lt: expect.any(String) },
      },
    });
  });

  it("preserves capture contract when cleanup fails", async () => {
    const created = { id: 5, eventId: "lead_form_start" };
    const strapi = createStrapiMock(
      created,
      Promise.reject(new Error("DB connection lost")),
    );
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/analytics-event/services/analytics-event"
    );
    const service = serviceModule.default as {
      capture: (input: Record<string, unknown>) => Promise<unknown>;
    };

    const result = await service.capture({
      eventId: "lead_form_start",
      pagePath: "/egitimler",
    });

    expect(result).toEqual({
      success: true,
      message: "Event captured.",
      eventId: 5,
    });

    expect(strapi.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventId: "lead_form_start",
        pagePath: "/egitimler",
      }),
    });

    expect(strapi.log.warn).toHaveBeenCalledWith(
      "Analytics retention cleanup failed",
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("does not delete recent events during cleanup", async () => {
    const created = { id: 6, eventId: "lead_catalog_click" };
    const strapi = createStrapiMock(created);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import(
      "../../../src/api/analytics-event/services/analytics-event"
    );
    const service = serviceModule.default as {
      capture: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await service.capture({ eventId: "lead_catalog_click" });

    const deleteCall = strapi.deleteMany.mock.calls[0][0];
    expect(deleteCall.filters.createdAt.$lt).toBeTruthy();

    const cutoffDate = new Date(deleteCall.filters.createdAt.$lt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const diffMs = Math.abs(cutoffDate.getTime() - thirtyDaysAgo.getTime());
    expect(diffMs).toBeLessThan(5000);
  });
});

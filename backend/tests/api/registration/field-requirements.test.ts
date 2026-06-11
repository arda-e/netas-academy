import { afterEach, describe, expect, it, vi } from "vitest";

const deliverFn = vi.fn();

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (_uid: string, factory: () => unknown) => factory(),
  },
}));

vi.mock("@strapi/utils", () => ({
  errors: {
    NotFoundError: class NotFoundError extends Error {},
    ValidationError: class ValidationError extends Error {},
  },
}));

vi.mock("../../../src/services/internal-notifications/strapi-service", () => ({
  deliverInternalNotificationViaStrapi: (_strapi: unknown, envelope: unknown) => deliverFn(envelope),
}));

vi.mock("../../../src/services/spl-check/service", () => ({
  runSplCheck: vi.fn().mockResolvedValue({
    provider: "sap_soap",
    decision: "clear",
    statusCode: "10",
    rawResponse: "<Status>10</Status>",
  }),
}));

describe("registration service — event-type field-requirement matrix", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  function makeStrapi(eventType: string | null | undefined) {
    const eventRecord = {
      id: 10,
      documentId: "evt_123",
      title: "Demo",
      slug: "demo",
      startsAt: "2027-04-22T09:00:00.000Z",
      keepRegistrationsOpen: true,
      location: "Istanbul",
      eventType,
    };
    const studentRecord = { id: 20, firstName: "Ada", lastName: "Kaya", email: "ada@example.com", phone: null };

    deliverFn.mockResolvedValue(undefined);

    const strapi = {
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::event.event") return { findOne: vi.fn().mockResolvedValue(eventRecord) };
          if (uid === "api::registration.registration") {
            return {
              findOne: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue({
                id: 1,
                status: "pending",
                notes: null,
                event: eventRecord,
                student: studentRecord,
              }),
            };
          }
          throw new Error(`Unexpected uid: ${uid}`);
        }),
        transaction: vi.fn((fn: () => unknown) => fn()),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail: vi.fn().mockResolvedValue(studentRecord) }),
      log: { error: vi.fn() },
    };

    vi.stubGlobal("strapi", strapi);
    return strapi;
  }

  async function getService() {
    const mod = await import("../../../src/api/registration/services/registration");
    return mod.default as unknown as {
      registerStudentForEvent: (input: {
        eventDocumentId: string;
        student: { firstName: string; email: string; tckn?: string };
        kvkkConsent?: boolean;
      }) => Promise<unknown>;
    };
  }

  const VALID_TCKN = "10000000078";

  it("etkinlik: succeeds without TCKN or kvkkConsent", async () => {
    makeStrapi("etkinlik");
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com" },
      }),
    ).resolves.toBeDefined();
  });

  it("egitim: succeeds with valid TCKN and kvkkConsent=true", async () => {
    makeStrapi("egitim");
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com", tckn: VALID_TCKN },
        kvkkConsent: true,
      }),
    ).resolves.toBeDefined();
  });

  it("kurs: succeeds with valid TCKN and kvkkConsent=true", async () => {
    makeStrapi("kurs");
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com", tckn: VALID_TCKN },
        kvkkConsent: true,
      }),
    ).resolves.toBeDefined();
  });

  it("egitim: throws when TCKN is absent", async () => {
    makeStrapi("egitim");
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com" },
        kvkkConsent: true,
      }),
    ).rejects.toThrow("Invalid TCKN");
  });

  it("egitim: throws when kvkkConsent is false", async () => {
    makeStrapi("egitim");
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com", tckn: VALID_TCKN },
        kvkkConsent: false,
      }),
    ).rejects.toThrow("kvkkConsent must be true");
  });

  it("kurs: throws when TCKN is absent", async () => {
    makeStrapi("kurs");
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com" },
        kvkkConsent: true,
      }),
    ).rejects.toThrow("Invalid TCKN");
  });

  it("kurs: throws when kvkkConsent is false", async () => {
    makeStrapi("kurs");
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com", tckn: VALID_TCKN },
        kvkkConsent: false,
      }),
    ).rejects.toThrow("kvkkConsent must be true");
  });

  it("null eventType: succeeds without TCKN or kvkkConsent (safe default = etkinlik)", async () => {
    makeStrapi(null);
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com" },
      }),
    ).resolves.toBeDefined();
  });

  it("undefined eventType: succeeds without TCKN or kvkkConsent (safe default = etkinlik)", async () => {
    makeStrapi(undefined);
    const service = await getService();
    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: { firstName: "Ada", email: "ada@example.com" },
      }),
    ).resolves.toBeDefined();
  });
});

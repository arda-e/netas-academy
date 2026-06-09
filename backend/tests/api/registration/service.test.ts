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

describe("registration service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  function createStrapiMock(overrides: Record<string, unknown> = {}) {
    return {
      db: {
        transaction: vi.fn((fn: () => unknown) => fn()),
      },
      log: {
        error: vi.fn(),
      },
      ...overrides,
    };
  }

  it("persists first, then triggers event routing without failing when notification delivery rejects", async () => {
    const events: string[] = [];
    const eventRecord = {
      id: 10,
      documentId: "evt_123",
      title: "Demo Etkinlik",
      slug: "demo-etkinlik",
      startsAt: "2026-04-22T09:00:00.000Z",
      keepRegistrationsOpen: true,
      location: "Istanbul Campus",
      eventType: "etkinlik",
    };
    const studentRecord = {
      id: 20,
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
    };
    const createdRegistration = {
      id: 42,
      status: "pending",
      notes: "Sertifika talebi var",
      event: eventRecord,
      student: studentRecord,
    };

    const eventFindOne = vi.fn().mockResolvedValue(eventRecord);
    const registrationFindOne = vi.fn().mockResolvedValue(null);
    const registrationCreate = vi.fn().mockImplementation(async () => {
      events.push("create");
      return createdRegistration;
    });
    const upsertByEmail = vi.fn().mockResolvedValue(studentRecord);

    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::event.event") {
            return { findOne: eventFindOne };
          }

          if (uid === "api::registration.registration") {
            return {
              findOne: registrationFindOne,
              create: registrationCreate,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
        transaction: vi.fn((fn: () => unknown) => fn()),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail }),
    });

    deliverFn.mockImplementation(async () => {
      events.push("notify");
      throw new Error("SMTP timeout");
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/registration/services/registration");
    const service = serviceModule.default as {
      registerStudentForEvent: (input: {
        eventDocumentId: string;
        student: {
          firstName: string;
          lastName?: string;
          email: string;
          phone?: string;
          tckn: string;
        };
        notes?: string;
      }) => Promise<{ id: number; status: string; event: { documentId: string; title: string } }>;
    };

    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: {
          firstName: "Ada",
          lastName: "Kaya",
          email: "ada@example.com",
          phone: "+90 555 111 2233",
          tckn: "12345678901",
        },
        notes: "Sertifika talebi var",
      }),
    ).resolves.toEqual({
      id: 42,
      status: "pending",
      event: {
        documentId: "evt_123",
        title: "Demo Etkinlik",
      },
    });

    expect(registrationCreate).toHaveBeenCalledWith({
      data: {
        status: "pending",
        notes: "Sertifika talebi var",
        event: 10,
        student: 20,
      },
      populate: {
        event: true,
        student: true,
      },
    });
    expect(deliverFn).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "event_registration",
        payload: expect.objectContaining({
          registrationId: 42,
          student: expect.objectContaining({
            tckn: "*******8901",
          }),
        }),
      }),
    );
    expect(strapi.log.error).toHaveBeenCalledWith(
      "Event registration notification delivery failed",
      expect.objectContaining({
        registrationId: 42,
        error: expect.any(Error),
      }),
    );
    expect(events).toEqual(["create", "notify"]);
  });

  it("sends the notification with the persisted student identity on the happy path", async () => {
    const eventRecord = {
      id: 10,
      documentId: "evt_123",
      title: "Demo Etkinlik",
      slug: "demo-etkinlik",
      startsAt: "2026-04-22T09:00:00.000Z",
      keepRegistrationsOpen: true,
      location: "Istanbul Campus",
      eventType: "etkinlik",
    };
    const studentRecord = {
      id: 20,
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
    };
    const createdRegistration = {
      id: 43,
      status: "pending",
      notes: null,
      event: eventRecord,
      student: studentRecord,
    };
    const eventFindOne = vi.fn().mockResolvedValue(eventRecord);
    const registrationFindOne = vi.fn().mockResolvedValue(null);
    const registrationCreate = vi.fn().mockResolvedValue(createdRegistration);
    const upsertByEmail = vi.fn().mockResolvedValue(studentRecord);
    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::event.event") {
            return { findOne: eventFindOne };
          }

          if (uid === "api::registration.registration") {
            return {
              findOne: registrationFindOne,
              create: registrationCreate,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
        transaction: vi.fn((fn: () => unknown) => fn()),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail }),
    });

    deliverFn.mockResolvedValue({
      status: "sent",
      key: "event_registration",
      recipients: ["events@netas.com.tr"],
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/registration/services/registration");
    const service = serviceModule.default as {
      registerStudentForEvent: (input: {
        eventDocumentId: string;
        student: {
          firstName: string;
          lastName?: string;
          email: string;
          phone?: string;
          tckn: string;
        };
      }) => Promise<{ id: number; status: string; event: { documentId: string; title: string } }>;
    };

    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: {
          firstName: "Ada",
          lastName: "Kaya",
          email: "ada@example.com",
          phone: "+90 555 111 2233",
          tckn: "*******8901",
        },
      }),
    ).resolves.toEqual({
      id: 43,
      status: "pending",
      event: {
        documentId: "evt_123",
        title: "Demo Etkinlik",
      },
    });

    expect(deliverFn).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "event_registration",
        payload: expect.objectContaining({
          registrationId: 43,
          student: expect.objectContaining({
            tckn: "*******8901",
          }),
        }),
      }),
    );
    expect(strapi.log.error).not.toHaveBeenCalled();
  });

  it("keeps event-not-found behavior and does not upsert, create, or notify", async () => {
    const eventFindOne = vi.fn().mockResolvedValue(null);
    const registrationFindOne = vi.fn();
    const registrationCreate = vi.fn();
    const upsertByEmail = vi.fn();
    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::event.event") {
            return { findOne: eventFindOne };
          }

          if (uid === "api::registration.registration") {
            return {
              findOne: registrationFindOne,
              create: registrationCreate,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
        transaction: vi.fn((fn: () => unknown) => fn()),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail }),
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/registration/services/registration");
    const service = serviceModule.default as {
      registerStudentForEvent: (input: {
        eventDocumentId: string;
        student: {
          firstName: string;
          email: string;
          tckn: string;
        };
      }) => Promise<unknown>;
    };

    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_missing",
        student: {
          firstName: "Ada",
          email: "ada@example.com",
          tckn: "12345678901",
        },
      }),
    ).rejects.toThrow("Event not found");

    expect(upsertByEmail).not.toHaveBeenCalled();
    expect(registrationFindOne).not.toHaveBeenCalled();
    expect(registrationCreate).not.toHaveBeenCalled();
    expect(deliverFn).not.toHaveBeenCalled();
  });

  it("keeps duplicate-registration behavior and returns idempotent success without creating", async () => {
    const eventRecord = {
      id: 10,
      documentId: "evt_123",
      title: "Demo Etkinlik",
      slug: "demo-etkinlik",
      startsAt: "2026-04-22T09:00:00.000Z",
      keepRegistrationsOpen: true,
      location: "Istanbul Campus",
      eventType: "etkinlik",
    };
    const existingReg = {
      id: 99,
      status: "confirmed",
      notes: null,
      event: eventRecord,
      student: { id: 20, firstName: "Ada", lastName: null, email: "ada@example.com", phone: null },
    };
    const eventFindOne = vi.fn().mockResolvedValue(eventRecord);
    const registrationFindOne = vi.fn().mockResolvedValue(existingReg);
    const registrationCreate = vi.fn();
    const upsertByEmail = vi.fn().mockResolvedValue({ id: 20 });

    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::event.event") {
            return { findOne: eventFindOne };
          }

          if (uid === "api::registration.registration") {
            return {
              findOne: registrationFindOne,
              create: registrationCreate,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
        transaction: vi.fn((fn: () => unknown) => fn()),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail }),
    });

    deliverFn.mockResolvedValue(undefined);
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/registration/services/registration");
    const service = serviceModule.default as {
      registerStudentForEvent: (input: {
        eventDocumentId: string;
        student: {
          firstName: string;
          email: string;
          tckn: string;
        };
      }) => Promise<{ id: number; status: string; event: { documentId: string; title: string } }>;
    };

    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: {
          firstName: "Ada",
          email: "ada@example.com",
          tckn: "12345678901",
        },
      }),
    ).resolves.toEqual({
      id: 99,
      status: "confirmed",
      event: {
        documentId: "evt_123",
        title: "Demo Etkinlik",
      },
    });

    expect(registrationCreate).not.toHaveBeenCalled();
    expect(deliverFn).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "event_registration",
        payload: expect.objectContaining({
          registrationId: 99,
          status: "confirmed",
        }),
      }),
    );
  });

  it("keeps closed-registration behavior and does not upsert, create, or notify", async () => {
    const eventFindOne = vi.fn().mockResolvedValue({
      id: 10,
      documentId: "evt_123",
      title: "Demo Etkinlik",
      slug: "demo-etkinlik",
      startsAt: "2026-04-12T09:00:00.000Z",
      keepRegistrationsOpen: false,
    });
    const registrationFindOne = vi.fn();
    const registrationCreate = vi.fn();
    const upsertByEmail = vi.fn();

    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::event.event") {
            return { findOne: eventFindOne };
          }

          if (uid === "api::registration.registration") {
            return {
              findOne: registrationFindOne,
              create: registrationCreate,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
        transaction: vi.fn((fn: () => unknown) => fn()),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail }),
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/registration/services/registration");
    const service = serviceModule.default as {
      registerStudentForEvent: (input: {
        eventDocumentId: string;
        student: {
          firstName: string;
          email: string;
          tckn: string;
        };
      }) => Promise<unknown>;
    };

    await expect(
      service.registerStudentForEvent({
        eventDocumentId: "evt_123",
        student: {
          firstName: "Ada",
          email: "ada@example.com",
          tckn: "12345678901",
        },
      }),
    ).rejects.toThrow("Event registration is closed");

    expect(upsertByEmail).not.toHaveBeenCalled();
    expect(registrationFindOne).not.toHaveBeenCalled();
    expect(registrationCreate).not.toHaveBeenCalled();
    expect(deliverFn).not.toHaveBeenCalled();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runSplCheck = vi.fn();
const deliverFn = vi.fn();
const createCheckoutHandoff = vi.fn();

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

vi.mock("../../../src/services/spl-check/service", () => ({
  runSplCheck,
}));

vi.mock("../../../src/services/internal-notifications/strapi-service", () => ({
  deliverInternalNotificationViaStrapi: (_strapi: unknown, envelope: unknown) => deliverFn(envelope),
}));

vi.mock("../../../src/services/payment-orchestration/service", () => ({
  createCheckoutHandoff: (...args: unknown[]) => createCheckoutHandoff(...args),
}));

describe("course-application service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    createCheckoutHandoff.mockResolvedValue({
      attemptReference: "pay_course",
      status: "checkout_created",
      provider: "iyzico",
      presentation: {
        kind: "iyzico_checkout_form",
        token: "checkout-token",
        checkoutFormContent: "<script>checkout</script>",
      },
    });
  });

  function createStrapiMock(overrides: Record<string, unknown> = {}) {
    return {
      log: {
        error: vi.fn(),
      },
      ...overrides,
    };
  }

  it("creates an application, maps a clear SPL result (Status 10), and resolves payment state", async () => {
    const events: string[] = [];
    const courseRecord = {
      id: 10,
      documentId: "course_123",
      title: "Matematik",
      slug: "matematik",
    };
    const studentRecord = {
      id: 20,
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
    };
    const draftApplication = {
      id: 30,
      applicationNumber: "CA-20260424-AB12CD",
      status: "submitted",
      manualReview: false,
      applicantSnapshot: {
        tckn: "10000000146",
      },
      course: courseRecord,
      student: studentRecord,
      integrationProvider: "sap_soap",
      integrationDecision: "pending",
      integrationStatusCode: null,
      integrationReference: null,
    };
    const finalApplication = {
      ...draftApplication,
      status: "pending_payment",
      integrationDecision: "clear",
      integrationStatusCode: "10",
      paymentStatus: "pending",
      paymentUrlSnapshot: "https://pay.example.com/matematik",
    };

    const courseFindOne = vi.fn().mockResolvedValue(courseRecord);
    const applicationFindOne = vi.fn().mockResolvedValue(null);
    const create = vi.fn().mockResolvedValue(draftApplication);
    const update = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
      events.push(data.lastNotificationSentAt ? "update:lastNotificationSentAt" : `update:${String(data.status)}`);
      return events.length === 1 ? draftApplication : finalApplication;
    });
    const upsertByEmail = vi.fn().mockResolvedValue(studentRecord);

    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::course.course") {
            return { findOne: courseFindOne };
          }

          if (uid === "api::course-application.course-application") {
            return {
              findOne: applicationFindOne,
              create,
              update,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
      },
      service: vi.fn((uid: string) => {
        if (uid === "api::student.student") {
          return { upsertByEmail };
        }

        throw new Error(`Unexpected service uid: ${uid}`);
      }),
    });

    runSplCheck.mockResolvedValue({
      provider: "sap_soap",
      decision: "clear",
      statusCode: "10",
      rawResponse: "<Status>10</Status>",
    });

    deliverFn.mockResolvedValue({
      status: "sent",
      key: "course_payment_pending",
      recipients: ["ops@netas.com.tr"],
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as unknown as {
      submitApplication: (input: {
        courseDocumentId: string;
        student: {
          firstName: string;
          lastName?: string | null;
          email: string;
          phone?: string | null;
          tckn: string;
          address?: string | null;
        };
        consents: {
          kvkk: boolean;
          salesAgreement: boolean;
          commercialElectronicMessage?: boolean;
        };
        notes?: string | null;
      }, options?: { paymentUrlTemplate?: string | null }) => Promise<Record<string, unknown>>;
    };

    await expect(
      service.submitApplication(
        {
          courseDocumentId: "course_123",
          student: {
            firstName: " Ada ",
            lastName: " Kaya ",
            email: " ADA@EXAMPLE.COM ",
            phone: " +90 555 111 2233 ",
            tckn: "10000000146",
            address: " Istanbul ",
          },
          consents: {
            kvkk: true,
            salesAgreement: true,
          },
          notes: "Başvuru notu",
        },
        {
          paymentUrlTemplate: "https://pay.example.com/{courseSlug}",
        },
      ),
    ).resolves.toEqual({
      applicationId: 30,
      applicationNumber: expect.stringMatching(/^CA-/),
      status: "pending_payment",
      manualReview: false,
      integration: {
        provider: "sap_soap",
        statusCode: "10",
        decision: "clear",
      },
      nextAction: "render_checkout",
      paymentUrl: "https://pay.example.com/matematik",
      payment: expect.objectContaining({
        status: "checkout_created",
        provider: "iyzico",
      }),
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          applicationNumber: expect.stringMatching(/^CA-/),
          activeApplicationKey: "10:20",
          status: "submitted",
          manualReview: false,
          integrationDecision: "pending",
        }),
      }),
    );
    expect(runSplCheck).toHaveBeenCalledWith({
      applicationNumber: expect.stringMatching(/^CA-/),
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
      tckn: "10000000146",
      courseDocumentId: "course_123",
    });
    expect(deliverFn).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "course_payment_pending",
        payload: expect.objectContaining({
          applicationNumber: expect.stringMatching(/^CA-/),
          status: "pending_payment",
          nextAction: "render_checkout",
          student: expect.objectContaining({
            tckn: "****",
          }),
        }),
      }),
    );
    expect(events).toEqual(["update:integration_pending", "update:pending_payment", "update:lastNotificationSentAt"]);
  });

  it("does not persist lastNotificationSentAt when notification delivery fails", async () => {
    const courseRecord = {
      id: 10,
      documentId: "course_123",
      title: "Matematik",
      slug: "matematik",
    };
    const studentRecord = {
      id: 20,
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
    };
    const draftApplication = {
      id: 30,
      applicationNumber: "CA-20260424-AB12CD",
      status: "submitted",
      manualReview: false,
      applicantSnapshot: {
        tckn: "10000000146",
      },
      course: courseRecord,
      student: studentRecord,
      integrationProvider: "sap_soap",
      integrationDecision: "pending",
      integrationStatusCode: null,
      integrationReference: null,
    };
    const finalApplication = {
      ...draftApplication,
      status: "pending_payment",
      integrationDecision: "clear",
      integrationStatusCode: "10",
      paymentStatus: "pending",
      paymentUrlSnapshot: "https://pay.example.com/matematik",
    };

    const update = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
      data.status === "integration_pending" ? draftApplication : finalApplication,
    );
    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::course.course") {
            return { findOne: vi.fn().mockResolvedValue(courseRecord) };
          }

          if (uid === "api::course-application.course-application") {
            return {
              findOne: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(draftApplication),
              update,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail: vi.fn().mockResolvedValue(studentRecord) }),
    });

    runSplCheck.mockResolvedValue({
      provider: "sap_soap",
      decision: "clear",
      statusCode: "10",
      rawResponse: "<Status>10</Status>",
    });
    deliverFn.mockRejectedValue(new Error("SMTP timeout"));
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as unknown as {
      submitApplication: (
        input: Record<string, unknown>,
        options?: Record<string, unknown>,
      ) => Promise<Record<string, unknown>>;
    };

    await expect(
      service.submitApplication(
        {
          courseDocumentId: "course_123",
          student: {
            firstName: "Ada",
            email: "ada@example.com",
            tckn: "10000000146",
          },
          consents: {
            kvkk: true,
            salesAgreement: true,
          },
        },
        {
          paymentUrlTemplate: "https://pay.example.com/{courseSlug}",
        },
      ),
    ).resolves.toMatchObject({
      status: "pending_payment",
      nextAction: "render_checkout",
    });

    expect(update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lastNotificationSentAt: expect.any(String),
        }),
      }),
    );
    expect(strapi.log.error).toHaveBeenCalledWith(
      "Course application notification delivery failed",
      expect.objectContaining({
        applicationId: 30,
        error: expect.any(Error),
      }),
    );
  });

  it("rejects duplicate active applications for the same student and course", async () => {
    const courseRecord = {
      id: 10,
      documentId: "course_123",
      title: "Matematik",
      slug: "matematik",
    };
    const studentRecord = {
      id: 20,
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
    };

    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::course.course") {
            return { findOne: vi.fn().mockResolvedValue(courseRecord) };
          }

          if (uid === "api::course-application.course-application") {
            return {
              findOne: vi.fn().mockResolvedValue({
                id: 99,
                status: "pending_payment",
              }),
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
      },
      service: vi.fn().mockReturnValue({
        upsertByEmail: vi.fn().mockResolvedValue(studentRecord),
      }),
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as unknown as {
      submitApplication: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await expect(
      service.submitApplication({
        courseDocumentId: "course_123",
        student: {
          firstName: "Ada",
          email: "ada@example.com",
          tckn: "10000000146",
        },
        consents: {
          kvkk: true,
          salesAgreement: true,
        },
      }),
    ).rejects.toThrow("Student already has an active application for this course");
  });

  it("maps a unique active application collision to the duplicate validation error", async () => {
    const courseRecord = {
      id: 10,
      documentId: "course_123",
      title: "Matematik",
      slug: "matematik",
    };
    const studentRecord = {
      id: 20,
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
    };
    const applicationFindOne = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 99, activeApplicationKey: "10:20" });
    const create = vi.fn().mockRejectedValue(new Error("UNIQUE constraint failed: course_applications.active_application_key"));

    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::course.course") {
            return { findOne: vi.fn().mockResolvedValue(courseRecord) };
          }

          if (uid === "api::course-application.course-application") {
            return {
              findOne: applicationFindOne,
              create,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
      },
      service: vi.fn().mockReturnValue({
        upsertByEmail: vi.fn().mockResolvedValue(studentRecord),
      }),
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as unknown as {
      submitApplication: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await expect(
      service.submitApplication({
        courseDocumentId: "course_123",
        student: {
          firstName: "Ada",
          email: "ada@example.com",
          tckn: "10000000146",
        },
        consents: {
          kvkk: true,
          salesAgreement: true,
        },
      }),
    ).rejects.toThrow("Student already has an active application for this course");

    expect(runSplCheck).not.toHaveBeenCalled();
  });

  it("falls back to manual review when the SPL integration fails", async () => {
    const courseRecord = {
      id: 10,
      documentId: "course_123",
      title: "Matematik",
      slug: "matematik",
    };
    const studentRecord = {
      id: 20,
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
    };
    const draftApplication = {
      id: 30,
      applicationNumber: "CA-20260424-AB12CD",
      status: "submitted",
      manualReview: false,
      applicantSnapshot: {
        tckn: "10000000146",
      },
      course: courseRecord,
      student: studentRecord,
      integrationProvider: "sap_soap",
      integrationDecision: "pending",
      integrationStatusCode: null,
      integrationReference: null,
    };
    const finalApplication = {
      ...draftApplication,
      status: "manual_review",
      manualReview: true,
      integrationDecision: "manual_review",
      paymentStatus: "not_started",
    };

    const courseFindOne = vi.fn().mockResolvedValue(courseRecord);
    const applicationFindOne = vi.fn().mockResolvedValue(null);
    const create = vi.fn().mockResolvedValue(draftApplication);
    const update = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
      if (data.status === "integration_pending") {
        return draftApplication;
      }

      return finalApplication;
    });
    const upsertByEmail = vi.fn().mockResolvedValue(studentRecord);

    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::course.course") {
            return { findOne: courseFindOne };
          }

          if (uid === "api::course-application.course-application") {
            return {
              findOne: applicationFindOne,
              create,
              update,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail }),
    });

    runSplCheck.mockResolvedValue({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      rawResponse: "<soap:Envelope />",
      errorReason: "SOAP response did not contain a Status value",
    });

    deliverFn.mockResolvedValue({
      status: "sent",
      key: "course_application_manual_review",
      recipients: ["ops@netas.com.tr"],
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as unknown as {
      submitApplication: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };

    await expect(
      service.submitApplication({
        courseDocumentId: "course_123",
        student: {
          firstName: "Ada",
          email: "ada@example.com",
          tckn: "10000000146",
        },
        consents: {
          kvkk: true,
          salesAgreement: true,
        },
      }),
    ).resolves.toMatchObject({
      status: "manual_review",
      manualReview: true,
      integration: {
        decision: "manual_review",
        statusCode: null,
      },
      nextAction: "show_support_message",
    });
  });

  it("maps blocked SPL decisions (Status 30, kara liste) to cancelled and clears active application key", async () => {
    const courseRecord = {
      id: 10,
      documentId: "course_123",
      title: "Matematik",
      slug: "matematik",
    };
    const studentRecord = {
      id: 20,
      firstName: "Ada",
      lastName: "Kaya",
      email: "ada@example.com",
      phone: "+90 555 111 2233",
    };
    const draftApplication = {
      id: 30,
      applicationNumber: "CA-20260424-AB12CD",
      status: "submitted",
      manualReview: false,
      applicantSnapshot: {
        tckn: "10000000146",
      },
      course: courseRecord,
      student: studentRecord,
      integrationProvider: "sap_soap",
      integrationDecision: "pending",
      integrationStatusCode: null,
      integrationReference: null,
    };
    const finalApplication = {
      ...draftApplication,
      status: "cancelled",
      manualReview: false,
      integrationDecision: "blocked",
      integrationStatusCode: "30",
      paymentStatus: "not_started",
    };
    const update = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
      if (data.status === "integration_pending") {
        return draftApplication;
      }

      return finalApplication;
    });

    const strapi = createStrapiMock({
      db: {
        query: vi.fn((uid: string) => {
          if (uid === "api::course.course") {
            return { findOne: vi.fn().mockResolvedValue(courseRecord) };
          }

          if (uid === "api::course-application.course-application") {
            return {
              findOne: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(draftApplication),
              update,
            };
          }

          throw new Error(`Unexpected query uid: ${uid}`);
        }),
      },
      service: vi.fn().mockReturnValue({ upsertByEmail: vi.fn().mockResolvedValue(studentRecord) }),
    });

    runSplCheck.mockResolvedValue({
      provider: "sap_soap",
      decision: "blocked",
      statusCode: "30",
      rawResponse: "<Status>30</Status>",
    });
    deliverFn.mockResolvedValue({
      status: "sent",
      key: "course_application_submitted",
      recipients: ["ops@netas.com.tr"],
    });
    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as unknown as {
      submitApplication: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };

    await expect(
      service.submitApplication({
        courseDocumentId: "course_123",
        student: {
          firstName: "Ada",
          email: "ada@example.com",
          tckn: "10000000146",
        },
        consents: {
          kvkk: true,
          salesAgreement: true,
        },
      }),
    ).resolves.toMatchObject({
      status: "cancelled",
      manualReview: false,
      integration: {
        decision: "blocked",
        statusCode: "30",
      },
      nextAction: "show_support_message",
      paymentUrl: null,
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "cancelled",
          activeApplicationKey: null,
        }),
      }),
    );
  });
});

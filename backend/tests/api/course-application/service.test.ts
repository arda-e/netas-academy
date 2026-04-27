import { afterEach, describe, expect, it, vi } from "vitest";

const runSplCheck = vi.fn();
const deliverInternalNotificationViaStrapi = vi.fn();

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
  deliverInternalNotificationViaStrapi,
}));

describe("course-application service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates an application, maps an accepted SPL result, and resolves payment state", async () => {
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
      integrationDecision: "accepted",
      integrationStatusCode: "10",
      paymentStatus: "pending",
      paymentUrlSnapshot: "https://pay.example.com/matematik",
    };

    const courseFindOne = vi.fn().mockResolvedValue(courseRecord);
    const applicationFindOne = vi.fn().mockResolvedValue(null);
    const create = vi.fn().mockResolvedValue(draftApplication);
    const update = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
      events.push(`update:${String(data.status)}`);
      return events.length === 1 ? draftApplication : finalApplication;
    });
    const upsertByEmail = vi.fn().mockResolvedValue(studentRecord);

    const strapi = {
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
      log: {
        error: vi.fn(),
      },
    };

    runSplCheck.mockResolvedValue({
      provider: "sap_soap",
      decision: "accepted",
      statusCode: "10",
      rawResponse: "<Status>10</Status>",
    });

    deliverInternalNotificationViaStrapi.mockResolvedValue({
      status: "sent",
      key: "course_payment_pending",
      recipients: ["ops@netas.com.tr"],
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as {
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
        decision: "accepted",
      },
      nextAction: "redirect_to_payment",
      paymentUrl: "https://pay.example.com/matematik",
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          applicationNumber: expect.stringMatching(/^CA-/),
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
    expect(deliverInternalNotificationViaStrapi).toHaveBeenCalledWith(
      strapi,
      expect.objectContaining({
        key: "course_payment_pending",
        payload: expect.objectContaining({
          applicationNumber: expect.stringMatching(/^CA-/),
          status: "pending_payment",
          nextAction: "redirect_to_payment",
        }),
      }),
    );
    expect(events).toEqual(["update:integration_pending", "update:pending_payment"]);
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

    const strapi = {
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
      log: {
        error: vi.fn(),
      },
    };

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as {
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

    const strapi = {
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
      log: {
        error: vi.fn(),
      },
    };

    runSplCheck.mockResolvedValue({
      provider: "sap_soap",
      decision: "manual_review",
      statusCode: null,
      rawResponse: "<soap:Envelope />",
      errorReason: "SOAP response did not contain a Status value",
    });

    deliverInternalNotificationViaStrapi.mockResolvedValue({
      status: "sent",
      key: "course_application_manual_review",
      recipients: ["ops@netas.com.tr"],
    });

    vi.stubGlobal("strapi", strapi);

    const serviceModule = await import("../../../src/api/course-application/services/course-application");
    const service = serviceModule.default as {
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
});

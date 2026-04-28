import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { randomUUID } from "node:crypto";

import { normalizeTcknValue, isValidTckn, maskTcknValue, hashTcknForStorage } from "../../../utils/tckn";
import { deliverInternalNotificationViaStrapi } from "../../../services/internal-notifications/strapi-service";
import { runSplCheck } from "../../../services/spl-check/service";
import { resolveCourseApplicationOutcomeFromSplResult } from "../../../services/course-application/domain/course-application-status";
import type { CourseApplicationNotificationPayload } from "../../../services/internal-notifications/types";

const { NotFoundError, ValidationError } = errors;

type CourseApplicationSubmitInput = {
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
};

type CourseApplicationRecord = {
  id: number;
  applicationNumber: string;
  status: string;
  applicantSnapshot?: {
    tcknHash?: string | null;
  } | null;
  course: {
    documentId: string;
    title: string;
    slug: string;
  };
  student: {
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    tckn?: string | null;
  };
};

const ACTIVE_STATUSES = ["submitted", "integration_pending", "manual_review", "pending_payment"] as const;
const COURSE_APPLICATION_UID = "api::course-application.course-application" as const;

const normalizeWhitespace = (value?: string | null) => value?.trim().replace(/\s+/g, " ") || "";
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const buildActiveApplicationKey = (courseId: number, studentId: number) => `${courseId}:${studentId}`;
const isActiveApplicationStatus = (status: string) => ACTIVE_STATUSES.includes(status as (typeof ACTIVE_STATUSES)[number]);
const buildApplicationNumber = () =>
  `CA-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

const isUniqueConstraintError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  return /unique|constraint|duplicate/i.test(message);
};

const resolvePaymentUrl = (courseSlug: string, template?: string | null) => {
  const resolvedTemplate = template ?? process.env.COURSE_APPLICATION_PAYMENT_URL ?? "";

  if (!resolvedTemplate.trim()) {
    return null;
  }

  return resolvedTemplate.split("{courseSlug}").join(courseSlug);
};

const toApplicationNotificationPayload = (
  application: CourseApplicationRecord,
  nextAction: string,
  paymentUrl?: string | null,
): CourseApplicationNotificationPayload => ({
  applicationId: application.id,
  applicationNumber: application.applicationNumber,
  course: {
    documentId: application.course.documentId,
    title: application.course.title,
    slug: application.course.slug,
  },
  student: {
    firstName: application.student.firstName,
    lastName: application.student.lastName ?? null,
    email: application.student.email,
    phone: application.student.phone ?? null,
    tckn: maskTcknValue(application.student.tckn),
  },
  status: application.status,
  nextAction,
  paymentUrl: paymentUrl ?? null,
});

type CourseApplicationNotificationKey =
  | "course_application_submitted"
  | "course_application_manual_review"
  | "course_payment_pending";

const notifyApplicationResult = async (
  application: CourseApplicationRecord,
  nextAction: string,
  paymentUrl?: string | null,
) => {
  const notificationKey: CourseApplicationNotificationKey =
    application.status === "pending_payment"
      ? "course_payment_pending"
      : application.status === "manual_review"
        ? "course_application_manual_review"
        : "course_application_submitted";

  try {
    await deliverInternalNotificationViaStrapi(strapi, {
      key: notificationKey,
      payload: toApplicationNotificationPayload(application, nextAction, paymentUrl),
    });

    return true;
  } catch (error) {
    strapi.log.error("Course application notification delivery failed", {
      applicationId: application.id,
      error,
    });

    return false;
  }
};

export default factories.createCoreService("api::course-application.course-application" as any, () => ({
  async submitApplication(input: CourseApplicationSubmitInput, options: { paymentUrlTemplate?: string | null } = {}) {
    const firstName = normalizeWhitespace(input.student.firstName);
    const lastName = normalizeWhitespace(input.student.lastName);
    const email = normalizeEmail(input.student.email);
    const phone = normalizeWhitespace(input.student.phone);
    const tckn = normalizeTcknValue(input.student.tckn);
    const address = normalizeWhitespace(input.student.address);
    const courseDocumentId = normalizeWhitespace(input.courseDocumentId);

    if (
      !courseDocumentId ||
      !firstName ||
      !email ||
      !tckn ||
      !input.consents?.kvkk ||
      !input.consents?.salesAgreement
    ) {
      throw new ValidationError(
        "courseDocumentId, student.firstName, student.email, student.tckn, consents.kvkk, and consents.salesAgreement are required",
      );
    }

    if (!isValidTckn(tckn)) {
      throw new ValidationError("Invalid TCKN");
    }

    const course = await strapi.db.query("api::course.course").findOne({
      where: { documentId: courseDocumentId },
      select: ["id", "documentId", "title", "slug"],
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const student = await strapi.service("api::student.student").upsertByEmail({
      firstName,
      lastName,
      email,
      phone,
    });
    const activeApplicationKey = buildActiveApplicationKey(course.id, student.id);

    const existingApplication = await strapi.db.query("api::course-application.course-application").findOne({
      where: {
        course: { id: course.id },
        student: { id: student.id },
        status: { $in: ACTIVE_STATUSES },
      },
      populate: {
        course: true,
        student: true,
      },
    });

    if (existingApplication) {
      throw new ValidationError("Student already has an active application for this course");
    }

    const applicantSnapshot = {
      firstName,
      lastName: lastName || null,
      email,
      phone: phone || null,
      tcknHash: hashTcknForStorage(tckn),
      address: address || null,
    };
    const submittedAt = new Date().toISOString();

    let draftApplication: CourseApplicationRecord;

    const createDraftApplication = async (): Promise<CourseApplicationRecord> => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          return await strapi.db.query(COURSE_APPLICATION_UID).create({
            data: {
              applicationNumber: buildApplicationNumber(),
              activeApplicationKey,
              status: "submitted",
              manualReview: false,
              notes: input.notes ?? null,
              consents: input.consents,
              applicantSnapshot,
              submittedAt,
              integrationProvider: "sap_soap",
              integrationDecision: "pending",
              paymentStatus: "not_started",
              course: course.id,
              student: student.id,
            },
            populate: {
              course: true,
              student: true,
            },
          });
        } catch (error) {
          if (!isUniqueConstraintError(error)) {
            throw error;
          }

          const activeApplication = await strapi.db.query(COURSE_APPLICATION_UID).findOne({
            where: { activeApplicationKey },
            select: ["id"],
          });

          if (activeApplication) {
            throw new ValidationError("Student already has an active application for this course");
          }

          if (attempt === 2) {
            throw error;
          }
        }
      }

      throw new Error("Unable to create a unique course application number");
    };

    try {
      draftApplication =
        typeof strapi.db.transaction === "function"
          ? await strapi.db.transaction(createDraftApplication)
          : await createDraftApplication();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      throw error;
    }

    await strapi.db.query(COURSE_APPLICATION_UID).update({
      where: { id: draftApplication.id },
      data: {
        status: "integration_pending",
      },
    });

    const splResult = await runSplCheck({
      applicationNumber: draftApplication.applicationNumber,
      firstName,
      lastName,
      email,
      phone,
      tckn,
      courseDocumentId: course.documentId,
    });

    const outcome = resolveCourseApplicationOutcomeFromSplResult(splResult);
    const paymentUrl = outcome.status === "pending_payment" ? resolvePaymentUrl(course.slug, options.paymentUrlTemplate) : null;

    const finalApplication = await strapi.db.query(COURSE_APPLICATION_UID).update({
      where: { id: draftApplication.id },
      data: {
        status: outcome.status,
        activeApplicationKey: isActiveApplicationStatus(outcome.status) ? activeApplicationKey : null,
        manualReview: outcome.manualReview,
        completedAt: outcome.completedAt,
        integrationProvider: splResult.provider,
        integrationDecision: outcome.integrationDecision,
        integrationStatusCode: splResult.statusCode,
        integrationReference: splResult.errorReason ?? null,
        paymentStatus: outcome.paymentStatus,
        paymentProvider: outcome.status === "pending_payment" ? "local_payment_link" : null,
        paymentUrlSnapshot: paymentUrl,
      },
      populate: {
        course: true,
        student: true,
      },
    });

    const notificationSent = await notifyApplicationResult(finalApplication, outcome.nextAction, paymentUrl);

    if (notificationSent) {
      await strapi.db.query(COURSE_APPLICATION_UID).update({
        where: { id: finalApplication.id },
        data: {
          lastNotificationSentAt: new Date().toISOString(),
        },
      });
    }

    return {
      applicationId: finalApplication.id,
      applicationNumber: finalApplication.applicationNumber,
      status: finalApplication.status,
      manualReview: finalApplication.manualReview,
      integration: {
        provider: finalApplication.integrationProvider,
        statusCode: finalApplication.integrationStatusCode,
        decision: finalApplication.integrationDecision,
      },
      nextAction: outcome.nextAction,
      paymentUrl,
    };
  },
}));

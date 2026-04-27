import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

const { NotFoundError, ValidationError } = errors;

export default factories.createCoreController("api::course-application.course-application" as any, () => ({
  async submit(ctx) {
    const body = ctx.request.body ?? {};
    const student = body.student ?? {};
    const consents = body.consents ?? {};

    if (!body.courseDocumentId || !student.firstName || !student.email || !student.tckn) {
      throw new ValidationError(
        "courseDocumentId, student.firstName, student.email, and student.tckn are required",
      );
    }

    if (!consents.kvkk || !consents.salesAgreement) {
      throw new ValidationError(
        "consents.kvkk and consents.salesAgreement are required and must be true",
      );
    }

    const submission = await strapi.service("api::course-application.course-application").submitApplication({
      courseDocumentId: body.courseDocumentId,
      student,
      consents: body.consents,
      notes: body.notes,
    });

    if (!submission) {
      throw new NotFoundError("Course application could not be created");
    }

    ctx.body = { data: submission };
  },
}));

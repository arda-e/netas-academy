import { factories } from "@strapi/strapi";

import { formatError, formatSuccess, validateBody } from "../../../utils/controller-helpers";

export default factories.createCoreController("api::course-application.course-application" as any, () => ({
  async submit(ctx) {
    const body = ctx.request.body ?? {};
    const student = body.student ?? {};
    const consents = body.consents ?? {};

    const err = validateBody(body, ["courseDocumentId", "student.firstName", "student.email", "student.tckn"]);
    if (err) {
      ctx.body = err;
      ctx.status = err.status;
      return;
    }

    if (!consents.kvkk || !consents.salesAgreement) {
      const err = formatError(
        "consents.kvkk and consents.salesAgreement are required and must be true",
      );
      ctx.body = err;
      ctx.status = err.status;
      return;
    }

    const submission = await strapi.service("api::course-application.course-application").submitApplication({
      courseDocumentId: body.courseDocumentId,
      student,
      consents: body.consents,
      notes: body.notes,
    });

    if (!submission) {
      const err = formatError("Course application could not be created", 404);
      ctx.body = err;
      ctx.status = err.status;
      return;
    }

    ctx.body = formatSuccess(submission);
  },
}));

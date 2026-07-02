import type { PaymentParentDescriptor, ProviderPaymentResult } from "./types";

export type PaymentParentCompletionResult = {
  completed: boolean;
  parentStatus?: string;
};

export type PaymentParentAdapterDependencies = {
  strapiInstance?: any;
};

export async function completeParentPayment(
  parent: PaymentParentDescriptor,
  result: ProviderPaymentResult,
  dependencies: PaymentParentAdapterDependencies = {},
): Promise<PaymentParentCompletionResult> {
  const strapiRef = dependencies.strapiInstance ?? strapi;

  if (parent.parentType === "registration") {
    const registrationService = strapiRef.service("api::registration.registration");
    if (typeof registrationService.completePaidRegistration === "function") {
      return registrationService.completePaidRegistration({
        registrationId: parent.parentEntityId,
        result,
      });
    }

    await strapiRef.db.query("api::registration.registration").update({
      where: { id: parent.parentEntityId },
      data: { registrationStatus: "confirmed" },
    });
    return { completed: true, parentStatus: "confirmed" };
  }

  const courseApplicationService = strapiRef.service("api::course-application.course-application");
  if (typeof courseApplicationService.completePaidCourseApplication === "function") {
    return courseApplicationService.completePaidCourseApplication({
      applicationId: parent.parentEntityId,
      result,
    });
  }

  await strapiRef.db.query("api::course-application.course-application").update({
    where: { id: parent.parentEntityId },
    data: {
      status: "completed",
      paymentStatus: "paid",
      completedAt: new Date().toISOString(),
    },
  });
  return { completed: true, parentStatus: "completed" };
}

import type { SplCheckDecision, SplCheckResult } from "../../../services/spl-check/types";

export type CourseApplicationStatus =
  | "submitted"
  | "integration_pending"
  | "manual_review"
  | "pending_payment"
  | "completed_without_payment"
  | "completed"
  | "cancelled";

export type CourseApplicationPaymentStatus = "not_started" | "pending" | "paid" | "failed" | "cancelled";

export type CourseApplicationNextAction = "redirect_to_payment" | "show_support_message" | "show_finish_page";

export type CourseApplicationIntegrationDecision = SplCheckDecision | "pending";

export type CourseApplicationOutcome = {
  status: CourseApplicationStatus;
  manualReview: boolean;
  nextAction: CourseApplicationNextAction;
  integrationDecision: CourseApplicationIntegrationDecision;
  paymentStatus: CourseApplicationPaymentStatus;
  completedAt: string | null;
};

export function resolveCourseApplicationOutcomeFromSplResult(
  result: Pick<SplCheckResult, "decision" | "statusCode">,
  now = new Date().toISOString(),
): CourseApplicationOutcome {
  if (result.decision === "accepted") {
    return {
      status: "pending_payment",
      manualReview: false,
      nextAction: "redirect_to_payment",
      integrationDecision: "accepted",
      paymentStatus: "pending",
      completedAt: null,
    };
  }

  if (result.decision === "manual_review") {
    return {
      status: "manual_review",
      manualReview: true,
      nextAction: "show_support_message",
      integrationDecision: "manual_review",
      paymentStatus: "not_started",
      completedAt: null,
    };
  }

  return {
    status: "completed_without_payment",
    manualReview: false,
    nextAction: "show_finish_page",
    integrationDecision: "rejected",
    paymentStatus: "not_started",
    completedAt: now,
  };
}


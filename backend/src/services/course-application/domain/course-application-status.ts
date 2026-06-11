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
  _now = new Date().toISOString(),
): CourseApplicationOutcome {
  // SAP GTS status codes: 10 = clear (tertemiz), 20 = manual review, 30 = blacklisted (kara liste)
  if (result.decision === "blocked") {
    return {
      status: "cancelled",
      manualReview: false,
      nextAction: "show_support_message",
      integrationDecision: "blocked",
      paymentStatus: "not_started",
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
    status: "pending_payment",
    manualReview: false,
    nextAction: "redirect_to_payment",
    integrationDecision: "clear",
    paymentStatus: "pending",
    completedAt: null,
  };
}


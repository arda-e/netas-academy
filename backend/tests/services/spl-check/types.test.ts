import { describe, expect, it } from "vitest";

import { resolveCourseApplicationOutcomeFromSplResult } from "../../../src/services/course-application/domain/course-application-status";

describe("course application outcome mapping", () => {
  it("maps a blocked SPL result (Status 30, kara liste) to cancelled and show_support_message", () => {
    expect(
      resolveCourseApplicationOutcomeFromSplResult({
        decision: "blocked",
        statusCode: "30",
      }),
    ).toEqual({
      status: "cancelled",
      manualReview: false,
      nextAction: "show_support_message",
      integrationDecision: "blocked",
      paymentStatus: "not_started",
      completedAt: null,
    });
  });

  it("maps a manual review SPL result (Status 20) to manual_review and show_support_message", () => {
    expect(
      resolveCourseApplicationOutcomeFromSplResult({
        decision: "manual_review",
        statusCode: "20",
      }),
    ).toEqual({
      status: "manual_review",
      manualReview: true,
      nextAction: "show_support_message",
      integrationDecision: "manual_review",
      paymentStatus: "not_started",
      completedAt: null,
    });
  });

  it("maps a clear SPL result (Status 10, tertemiz) to pending_payment and redirect_to_payment", () => {
    expect(
      resolveCourseApplicationOutcomeFromSplResult({
        decision: "clear",
        statusCode: "10",
      }),
    ).toEqual({
      status: "pending_payment",
      manualReview: false,
      nextAction: "redirect_to_payment",
      integrationDecision: "clear",
      paymentStatus: "pending",
      completedAt: null,
    });
  });
});


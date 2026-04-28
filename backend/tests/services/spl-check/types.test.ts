import { describe, expect, it } from "vitest";

import { resolveCourseApplicationOutcomeFromSplResult } from "../../../src/services/course-application/domain/course-application-status";

describe("course application outcome mapping", () => {
  it("maps an accepted SPL result to pending_payment and redirect_to_payment", () => {
    expect(
      resolveCourseApplicationOutcomeFromSplResult({
        decision: "accepted",
        statusCode: "10",
      }),
    ).toEqual({
      status: "pending_payment",
      manualReview: false,
      nextAction: "redirect_to_payment",
      integrationDecision: "accepted",
      paymentStatus: "pending",
      completedAt: null,
    });
  });

  it("maps a manual review SPL result to manual_review and show_support_message", () => {
    expect(
      resolveCourseApplicationOutcomeFromSplResult({
        decision: "manual_review",
        statusCode: null,
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

  it("maps a rejected SPL result to completed_without_payment and show_finish_page", () => {
    expect(
      resolveCourseApplicationOutcomeFromSplResult(
        {
          decision: "rejected",
          statusCode: "42",
        },
        "2026-04-24T12:00:00.000Z",
      ),
    ).toEqual({
      status: "completed_without_payment",
      manualReview: false,
      nextAction: "show_finish_page",
      integrationDecision: "rejected",
      paymentStatus: "not_started",
      completedAt: "2026-04-24T12:00:00.000Z",
    });
  });
});


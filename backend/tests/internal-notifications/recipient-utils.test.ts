import { describe, expect, it } from "vitest";

import {
  coerceCustomRecipientEmails,
  normalizeRecipientEmails,
} from "../../src/services/internal-notifications/recipient-utils";

describe("normalizeRecipientEmails", () => {
  it("deduplicates admin-role and custom emails after trimming and lowercasing", () => {
    const recipients = normalizeRecipientEmails([
      " Ops@Netas.com.tr ",
      "ops@netas.com.tr",
      "sales@netas.com.tr",
      "",
      "invalid",
    ]);

    expect(recipients).toEqual(["ops@netas.com.tr", "sales@netas.com.tr"]);
  });

  it("coerces custom recipient emails from unknown input", () => {
    expect(coerceCustomRecipientEmails(["ops@netas.com.tr", 3, null, "sales@netas.com.tr"])).toEqual([
      "ops@netas.com.tr",
      "sales@netas.com.tr",
    ]);
    expect(coerceCustomRecipientEmails("ops@netas.com.tr")).toEqual([]);
  });
});

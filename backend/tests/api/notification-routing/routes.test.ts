import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("notification-routing routes", () => {
  it("uses the default core router export", () => {
    const routeFile = readFileSync(
      new URL("../../../src/api/notification-routing/routes/notification-routing.ts", import.meta.url),
      "utf8",
    );

    expect(routeFile).toContain("factories.createCoreRouter('api::notification-routing.notification-routing' as any)");
  });

  it("does not grant public read permissions in bootstrap", () => {
    const bootstrapFile = readFileSync(new URL("../../../src/index.ts", import.meta.url), "utf8");

    expect(bootstrapFile).toContain("const PUBLIC_READ_ACTIONS = [");
    expect(bootstrapFile).not.toContain("api::notification-routing.notification-routing.find");
    expect(bootstrapFile).not.toContain("api::notification-routing.notification-routing.findOne");
  });
});

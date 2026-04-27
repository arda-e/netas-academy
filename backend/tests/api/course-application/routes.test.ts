import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("course-application routes", () => {
  it("exposes the core router and custom submit route", () => {
    const coreRouteFile = readFileSync(
      new URL("../../../src/api/course-application/routes/course-application.ts", import.meta.url),
      "utf8",
    );
    const customRouteFile = readFileSync(
      new URL("../../../src/api/course-application/routes/custom-course-application.ts", import.meta.url),
      "utf8",
    );

    expect(coreRouteFile).toContain(
      'factories.createCoreRouter("api::course-application.course-application" as any)',
    );
    expect(customRouteFile).toContain('path: "/course-applications/submit"');
    expect(customRouteFile).toContain('handler: "course-application.submit"');
    expect(customRouteFile).toContain("auth: false");
  });
});


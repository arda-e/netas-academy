import { describe, expect, it } from "vitest";
import schema from "../../../src/api/teacher/content-types/teacher/schema.json";

describe("teacher schema", () => {
  it("has correct kind", () => {
    expect(schema.kind).toBe("collectionType");
  });

  it("has expertiseAreas, targetTeams, and teachingApproach fields", () => {
    expect(schema.attributes.expertiseAreas).toBeDefined();
    expect(schema.attributes.expertiseAreas.type).toBe("json");
    expect(schema.attributes.targetTeams).toBeDefined();
    expect(schema.attributes.targetTeams.type).toBe("text");
    expect(schema.attributes.teachingApproach).toBeDefined();
    expect(schema.attributes.teachingApproach.type).toBe("text");
  });

  it("has expertiseAreas, targetTeams, and teachingApproach as optional fields", () => {
    expect(schema.attributes.expertiseAreas.required).toBeUndefined();
    expect(schema.attributes.targetTeams.required).toBeUndefined();
    expect(schema.attributes.teachingApproach.required).toBeUndefined();
  });
});

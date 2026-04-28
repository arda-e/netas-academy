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

  it("has all attributes with correct types", () => {
    expect(schema.attributes.fullName).toEqual({
      type: "string",
      required: true,
    });
    expect(schema.attributes.slug).toMatchObject({
      type: "uid",
      required: true,
    });
    expect(schema.attributes.slug.targetField).toBe("fullName");
    expect(schema.attributes.headline).toEqual({
      type: "string",
    });
    expect(schema.attributes.bio).toEqual({
      type: "richtext",
    });
    expect(schema.attributes.email).toEqual({
      type: "email",
    });
    expect(schema.attributes.expertiseAreas).toEqual({
      type: "json",
    });
    expect(schema.attributes.targetTeams).toEqual({
      type: "text",
    });
    expect(schema.attributes.teachingApproach).toEqual({
      type: "text",
    });
    expect(schema.attributes.profilePhoto).toEqual({
      type: "media",
      multiple: false,
      allowedTypes: ["images"],
    });
    expect(schema.attributes.courses).toEqual({
      type: "relation",
      relation: "oneToMany",
      target: "api::course.course",
      mappedBy: "teacher",
    });
  });
});

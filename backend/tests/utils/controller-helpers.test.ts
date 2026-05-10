import { describe, expect, it } from "vitest";
import { formatError, formatSuccess, validateBody } from "../../src/utils/controller-helpers";

describe("formatError", () => {
  it("returns { error: { message }, status } with default status 400", () => {
    const result = formatError("some message");
    expect(result).toEqual({ error: { message: "some message" }, status: 400 });
  });

  it("returns { error: { message }, status } with custom status", () => {
    const result = formatError("msg", 422);
    expect(result).toEqual({ error: { message: "msg" }, status: 422 });
  });
});

describe("validateBody", () => {
  it("returns null when all required fields are present", () => {
    expect(validateBody({ fullName: "Ada" }, ["fullName"])).toBeNull();
  });

  it("returns formatted error for empty string value", () => {
    const result = validateBody({ fullName: "" }, ["fullName"]);
    expect(result).toEqual({
      error: { message: "fullName is required" },
      status: 400,
    });
  });

  it("returns formatted error for whitespace-only string value", () => {
    const result = validateBody({ fullName: "   " }, ["fullName"]);
    expect(result).toEqual({
      error: { message: "fullName is required" },
      status: 400,
    });
  });

  it("returns formatted error for null value", () => {
    const result = validateBody({ fullName: null }, ["fullName"]);
    expect(result).toEqual({
      error: { message: "fullName is required" },
      status: 400,
    });
  });

  it("returns formatted error for undefined value", () => {
    const result = validateBody({ fullName: undefined }, ["fullName"]);
    expect(result).toEqual({
      error: { message: "fullName is required" },
      status: 400,
    });
  });

  it("returns formatted error for missing key", () => {
    const result = validateBody({}, ["fullName"]);
    expect(result).toEqual({
      error: { message: "fullName is required" },
      status: 400,
    });
  });

  it("returns formatted error for nested field with null parent", () => {
    const result = validateBody({ student: null }, ["student.firstName"]);
    expect(result).toEqual({
      error: { message: "student.firstName is required" },
      status: 400,
    });
  });

  it("returns null when all nested fields are present", () => {
    expect(validateBody({ student: { firstName: "Ada" } }, ["student.firstName"])).toBeNull();
  });
});

describe("formatSuccess", () => {
  it("wraps data in { data } envelope", () => {
    expect(formatSuccess({ id: 1 })).toEqual({ data: { id: 1 } });
  });

  it("wraps null data", () => {
    expect(formatSuccess(null)).toEqual({ data: null });
  });
});

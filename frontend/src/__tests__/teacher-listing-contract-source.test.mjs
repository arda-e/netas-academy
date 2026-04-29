import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const readSource = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

test("StrapiTeacher type includes expertiseAreas field", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /expertiseAreas\?\s*:\s*string\[\]\s*\|\s*null/,
    "StrapiTeacher type should include expertiseAreas as string[] | null"
  );
});

test("StrapiTeacher type includes targetTeams field", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /targetTeams\?\s*:\s*string\s*\|\s*null/,
    "StrapiTeacher type should include targetTeams as string | null"
  );
});

test("StrapiTeacher type includes teachingApproach field", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /teachingApproach\?\s*:\s*string\s*\|\s*null/,
    "StrapiTeacher type should include teachingApproach as string | null"
  );
});

test("getTeachers query includes expertiseAreas field param", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /fields\[3\]=expertiseAreas/,
    "getTeachers should request expertiseAreas field"
  );
});

test("getTeachers query includes targetTeams field param", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /fields\[4\]=targetTeams/,
    "getTeachers should request targetTeams field"
  );
});

test("getTeachers query includes teachingApproach field param", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /fields\[5\]=teachingApproach/,
    "getTeachers should request teachingApproach field"
  );
});

test("getTeacherBySlug has no console.log debug statements", () => {
  const source = readSource("lib/strapi.ts");

  const getTeacherFn = source.substring(
    source.indexOf("export async function getTeacherBySlug"),
    source.indexOf("export async function getLatestCourses")
  );

  assert.doesNotMatch(
    getTeacherFn,
    /console\.log\(/,
    "getTeacherBySlug should not contain console.log"
  );
});

test("getTeacherBySlug query includes expertiseAreas field param", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /fields\[5\]=expertiseAreas/,
    "getTeacherBySlug should request expertiseAreas field"
  );
});

test("getTeacherBySlug query includes targetTeams field param", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /fields\[6\]=targetTeams/,
    "getTeacherBySlug should request targetTeams field"
  );
});

test("getTeacherBySlug query includes teachingApproach field param", () => {
  const source = readSource("lib/strapi.ts");
  assert.match(
    source,
    /fields\[7\]=teachingApproach/,
    "getTeacherBySlug should request teachingApproach field"
  );
});

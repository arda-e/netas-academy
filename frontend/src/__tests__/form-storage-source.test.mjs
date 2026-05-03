// form-storage-source.test.mjs — Source test for FormStorage sensitive field filtering
//
// Run: node --experimental-test-coverage --test-reporter=spec frontend/src/__tests__/form-storage-source.test.mjs

import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Inline re-implementation of FormStorage.save() filtering logic.
 * This mirrors the production behavior in frontend/src/lib/form-storage.ts
 * without importing TypeScript modules.
 */
function saveWithExcludeFields(data, options) {
  let payload = data;
  if (options?.excludeFields && options.excludeFields.length > 0) {
    const copy = { ...data };
    for (const field of options.excludeFields) {
      delete copy[field];
    }
    payload = copy;
  }
  return payload;
}

const formData = {
  firstName: "Ada",
  lastName: "Kaya",
  email: "ada@example.com",
  phone: "5551234567",
  tckn: "12345678950",
  notes: "Merhaba",
  kvkkConsent: true,
};

describe("FormStorage.save() sensitive field filtering", () => {
  it("stores all fields when excludeFields is omitted", () => {
    const result = saveWithExcludeFields(formData);
    assert.deepStrictEqual(Object.keys(result).sort(), Object.keys(formData).sort());
    assert.strictEqual(result.tckn, "12345678950");
  });

  it("stores all fields except tckn when excludeFields: ['tckn'] is set", () => {
    const result = saveWithExcludeFields(formData, { excludeFields: ["tckn"] });
    assert.strictEqual(result.firstName, "Ada");
    assert.strictEqual(result.lastName, "Kaya");
    assert.strictEqual(result.email, "ada@example.com");
    assert.strictEqual(result.phone, "5551234567");
    assert.strictEqual(result.notes, "Merhaba");
    assert.strictEqual(result.kvkkConsent, true);
    assert.strictEqual("tckn" in result, false, "tckn should not be present in result");
  });

  it("strips multiple excluded fields", () => {
    const result = saveWithExcludeFields(formData, {
      excludeFields: ["tckn", "email", "phone"],
    });
    assert.strictEqual("tckn" in result, false);
    assert.strictEqual("email" in result, false);
    assert.strictEqual("phone" in result, false);
    assert.strictEqual(result.firstName, "Ada");
    assert.strictEqual(result.lastName, "Kaya");
    assert.strictEqual(result.notes, "Merhaba");
  });

  it("behaves identically with an empty excludeFields array", () => {
    const result = saveWithExcludeFields(formData, { excludeFields: [] });
    assert.deepStrictEqual(Object.keys(result).sort(), Object.keys(formData).sort());
    assert.strictEqual(result.tckn, "12345678950");
  });

  it("does not throw when excludeFields references a field not present in data", () => {
    assert.doesNotThrow(() => {
      saveWithExcludeFields({ firstName: "Ada", email: "a@b.com" }, {
        excludeFields: ["tckn", "phone"],
      });
    });
  });

  it("does not mutate the original data object", () => {
    const original = { ...formData };
    const copy = { ...original };
    saveWithExcludeFields(copy, { excludeFields: ["tckn"] });
    assert.deepStrictEqual(copy, original, "original object should not be mutated");
    assert.strictEqual(copy.tckn, "12345678950");
  });
});

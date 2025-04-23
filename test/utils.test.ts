import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { formatDateYYYY_MM_DD } from "../src/utils";

describe("utils", () => {
  test("formatDateYYYY_MM_DD", (t) => {
    const someDate = new Date("2023-10-05T10:30:00Z");
    const formatted = formatDateYYYY_MM_DD(someDate);
    assert.strictEqual(formatted, "2023-10-05");
  });
});

import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  formatDateYYYY_MM_DD,
  makeAuthHeader,
  removeEmptyStrings,
} from "../src/utils";

describe("utils", () => {
  test("makeAuthHeader", (t) => {
    const username = "testuser";
    const password = "testpassword";
    const expectedHeader = "Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk"; // Base64 of 'testuser:testpassword'

    const authHeader = makeAuthHeader({ username, password });
    assert.strictEqual(authHeader, expectedHeader);
  });

  test("formatDateYYYY_MM_DD", (t) => {
    const someDate = new Date("2023-10-05T10:30:00Z");
    const formatted = formatDateYYYY_MM_DD(someDate);
    assert.strictEqual(formatted, "2023-10-05");
  });

  test("removeEmptyStrings", (t) => {
    const customer = {
      _id: "89fdd0e4-c775-11de-8728-40407c9117fd",
      _code: "test_customer",
      firstName: "Joe",
      lastName: "Schmoe",
      company: "",
      email: "joe.schmoe@example.com",
      notes: "",
      gatewayToken: "SIMULATED",
      isVatExempt: "0",
      vatNumber: "",
      firstContactDatetime: "2009-10-01T19:24:10+00:00",
      referer: "",
      refererHost: "",
      campaignSource: "",
      campaignMedium: "",
      campaignTerm: "",
      campaignContent: "",
      campaignName: "",
      createdDatetime: "2009-11-02T06:04:10+00:00",
      modifiedDatetime: "2009-11-02T06:04:10+00:00",
      metaData: "",
    };

    assert.deepStrictEqual(removeEmptyStrings(customer), {
      _id: "89fdd0e4-c775-11de-8728-40407c9117fd",
      _code: "test_customer",
      firstName: "Joe",
      lastName: "Schmoe",
      email: "joe.schmoe@example.com",
      gatewayToken: "SIMULATED",
      isVatExempt: "0",
      firstContactDatetime: "2009-10-01T19:24:10+00:00",
      createdDatetime: "2009-11-02T06:04:10+00:00",
      modifiedDatetime: "2009-11-02T06:04:10+00:00",
    });
  });
});

import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  parseCreateCustomerRequest,
  parseGetCustomersRequest,
} from "../src/parser";
import { CreateCustomerRequest, GetCustomersRequest } from "../src/types";

describe("Parser", () => {
  test("GetCustomersRequest", (t) => {
    const request: GetCustomersRequest = {
      subscriptionStatus: "activeOnly",
      planCode: ["PLAN_1", "PLAN_2"],
      createdBeforeDate: new Date("2023-11-05T10:30:00Z"),
      createdAfterDate: new Date("2023-10-05T10:30:00Z"),
      canceledBeforeDate: new Date("2023-11-05T10:30:00Z"),
      canceledAfterDate: new Date("2023-10-05T10:30:00Z"),
      transactedBeforeDate: new Date("2023-11-05T10:30:00Z"),
      transactedAfterDate: new Date("2023-10-05T10:30:00Z"),
      orderBy: "name",
      orderByDirection: "desc",
      searchText: "john",
    };
    const result = parseGetCustomersRequest(request);

    // Assert that the result is an instance of URLSearchParams
    assert.ok(
      result instanceof URLSearchParams,
      "Result should be a URLSearchParams object"
    );

    // Optionally, you can also assert the contents of the URLSearchParams
    const expectedParams = new URLSearchParams();
    expectedParams.set("subscriptionStatus", "activeOnly");
    expectedParams.append("planCode", "PLAN_1");
    expectedParams.append("planCode", "PLAN_2");
    expectedParams.set("createdBeforeDate", "2023-11-05");
    expectedParams.set("createdAfterDate", "2023-10-05");
    expectedParams.set("canceledBeforeDate", "2023-11-05");
    expectedParams.set("canceledAfterDate", "2023-10-05");
    expectedParams.set("transactedBeforeDate", "2023-11-05");
    expectedParams.set("transactedAfterDate", "2023-10-05");
    expectedParams.set("orderBy", "name");
    expectedParams.set("orderByDirection", "desc");
    expectedParams.set("searchText", "john");

    // Iterate through the expected parameters and ensure they exist in the result
    for (const [key, value] of expectedParams.entries()) {
      assert.strictEqual(
        result.getAll(key).includes(value),
        true,
        `Parameter ${key} should have value ${value}`
      );
    }
  });

  describe("CreateCustomerRequest", () => {
    test("minimal create request", (t) => {
      const request: CreateCustomerRequest = {
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
      };
      assert.deepStrictEqual(parseCreateCustomerRequest(request), {
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
      });
    });

    test("full create request", (t) => {
      const request: CreateCustomerRequest = {
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
        gatewayToken: "gatewayToken",
        company: "test-company",
        firstContactDatetime: new Date("2023-10-05T10:30:00Z"),
        subscription: {
          planCode: "PLAN_CODE",
          method: "cc",
          ccNumber: "4111111111111111",
          ccExpiration: "12/2030",
          ccType: "visa",
          ccCardCode: "123",
          ccFirstName: "FName",
          ccLastName: "LName",
          ccZip: "95123",
        },
      };
      assert.deepStrictEqual(parseCreateCustomerRequest(request), {
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
        gatewayToken: "gatewayToken",
        company: "test-company",
        firstContactDatetime: "2023-10-05",
        "subscription[planCode]": "PLAN_CODE",
        "subscription[method]": "cc",
        "subscription[ccNumber]": "4111111111111111",
        "subscription[ccExpiration]": "12/2030",
        "subscription[ccType]": "visa",
        "subscription[ccCardCode]": "123",
        "subscription[ccFirstName]": "FName",
        "subscription[ccLastName]": "LName",
        "subscription[ccZip]": "95123",
      });
    });
  });
});

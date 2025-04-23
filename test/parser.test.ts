import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  parseCreateCustomerRequest,
  parseGetCustomersRequest,
} from "../src/parser";
import {
  CreateCustomerRequest,
  GetCustomersRequest,
  SubscriptionData,
} from "../src/types";

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
    assert.deepStrictEqual(result, {
      subscriptionStatus: "activeOnly",
      planCode: ["PLAN_1", "PLAN_2"],
      createdBeforeDate: "2023-11-05",
      createdAfterDate: "2023-10-05",
      canceledBeforeDate: "2023-11-05",
      canceledAfterDate: "2023-10-05",
      transactedBeforeDate: "2023-11-05",
      transactedAfterDate: "2023-10-05",
      orderBy: "name",
      orderByDirection: "desc",
      searchText: "john",
    });
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

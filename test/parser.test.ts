import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { parseGetCustomersRequest } from "../src/parser";
import { GetCustomersRequest } from "../src/types";

describe("Parser", () => {
  test("getCustomersRequestParser", (t) => {
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
});

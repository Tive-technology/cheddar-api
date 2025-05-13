import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  parseAddCustomChargeData,
  parseCreateCustomerRequest,
  parseCreateOneTimeInvoiceData,
  parseCustomerAndSubscriptionData,
  parseEditCustomerData,
  parseGetCustomersRequest,
  parseIssueRefundRequest,
  parseItemQuantityData,
  parseSetItemQuantityData,
} from "./parser";
import {
  EditCustomerSubscriptionData,
  type AddCustomChargeData,
  type CreateCustomerRequest,
  type CreateOneTimeInvoiceData,
  type EditCustomerData,
  type GetCustomersRequest,
  type IssueRefundRequest,
  type ItemQuantityData,
  type SetItemQuantityData,
} from "./types";

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
      search: "john",
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
    expectedParams.set("search", "john");

    // Iterate through the expected parameters and ensure they exist in the result
    for (const [key, value] of expectedParams.entries()) {
      assert.deepStrictEqual(
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
      const result = parseCreateCustomerRequest(request);
      const expected = new URLSearchParams({
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
      });

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });

    test("create request + metadata", (t) => {
      const request: CreateCustomerRequest = {
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
        metaData: {
          meta1: "whatever1b",
          meta3: "whatever3",
          subarray: {
            meta3: "whatever3",
          },
        },
      };
      const result = parseCreateCustomerRequest(request);
      const expected = new URLSearchParams({
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
        "metaData[meta1]": "whatever1b",
        "metaData[meta3]": "whatever3",
        "metaData[subarray][meta3]": "whatever3",
      });

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });

    test("create request with subscription + cc", (t) => {
      const request: CreateCustomerRequest = {
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
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
      const result = parseCreateCustomerRequest(request);
      const expected = new URLSearchParams({
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
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

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });

    test("create request with subscription + gatewayToken", (t) => {
      const request: CreateCustomerRequest = {
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
        company: "test-company",
        firstContactDatetime: new Date("2023-10-05T10:30:00Z"),
        subscription: {
          planCode: "PLAN_CODE",
          gatewayToken: "cus_P1a2b3c4d5e6f7",
          ccLastFour: "1234",
          ccType: "visa",
          ccCompany: "VISA",
          initialBillDate: new Date("2011-08-01T15:30:00Z"),
        },
      };
      const result = parseCreateCustomerRequest(request);
      const expected = new URLSearchParams({
        code: "CUSTOMER_CODE",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
        company: "test-company",
        firstContactDatetime: "2023-10-05",
        "subscription[planCode]": "PLAN_CODE",
        "subscription[gatewayToken]": "cus_P1a2b3c4d5e6f7",
        "subscription[ccLastFour]": "1234",
        "subscription[ccType]": "visa",
        "subscription[ccCompany]": "VISA",
        "subscription[initialBillDate]": "2011-08-01T15:30:00.000Z",
      });

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });
  });

  describe("parseEditCustomerData", () => {
    test("full customer data", () => {
      const data: EditCustomerData = {
        firstName: "John",
        lastName: "Smith",
        email: "test@gmail.com",
        company: "Google",
        taxRate: 0.123,
        isTaxExempt: true,
        taxNumber: "123323232",
        referer: "referer",
        remoteAddress: "72.140.152.122",
        firstContactDatetime: new Date("2023-11-05T10:30:00Z"),
        campaignContent: "campaignContent",
        campaignMedium: "campaignMedium",
        campaignName: "campaignName",
        campaignSource: "campaignSource",
        campaignTerm: "campaignTerm",
        metaData: {
          customer_id: "cus_123456",
          referrer_code: "refer888",
          subArray: {
            item1: "item1",
          },
        },
      };
      const result = parseEditCustomerData(data);

      const expected = new URLSearchParams();
      expected.set("firstName", "John");
      expected.set("lastName", "Smith");
      expected.set("email", "test@gmail.com");
      expected.set("company", "Google");
      expected.set("taxRate", "0.123");
      expected.set("isTaxExempt", "1");
      expected.set("taxNumber", "123323232");
      expected.set("referer", "referer");
      expected.set("remoteAddress", "72.140.152.122");
      expected.set("firstContactDatetime", "2023-11-05T10:30:00.000Z");
      expected.set("campaignContent", "campaignContent");
      expected.set("campaignMedium", "campaignMedium");
      expected.set("campaignName", "campaignName");
      expected.set("campaignSource", "campaignSource");
      expected.set("campaignTerm", "campaignTerm");
      expected.set("metaData[customer_id]", "cus_123456");
      expected.set("metaData[referrer_code]", "refer888");
      expected.set("metaData[subArray][item1]", "item1");

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });
  });

  describe("parseCustomerAndSubscriptionData", () => {
    test("full customer data", () => {
      const data: EditCustomerSubscriptionData = {
        firstName: "John",
        lastName: "Smith",
        email: "test@gmail.com",
        company: "Google",
        taxRate: 0.123,
        isTaxExempt: true,
        taxNumber: "123323232",
        referer: "referer",
        remoteAddress: "72.140.152.122",
        firstContactDatetime: new Date("2023-11-05T10:30:00Z"),
        campaignContent: "campaignContent",
        campaignMedium: "campaignMedium",
        campaignName: "campaignName",
        campaignSource: "campaignSource",
        campaignTerm: "campaignTerm",
        subscription: {
          initialBillDate: new Date("2023-11-05T10:30:00Z"),
          planCode: "PLAN_CODE",
          gatewayToken: "GATEWAY_TOKEN",
          method: "cc",
        },
        metaData: {
          customer_id: "cus_123456",
          referrer_code: "refer888",
          subArray: {
            item1: "item1",
          },
        },
      };
      const result = parseCustomerAndSubscriptionData(data);

      const expected = new URLSearchParams();
      expected.set("firstName", "John");
      expected.set("lastName", "Smith");
      expected.set("email", "test@gmail.com");
      expected.set("company", "Google");
      expected.set("taxRate", "0.123");
      expected.set("isTaxExempt", "1");
      expected.set("taxNumber", "123323232");
      expected.set("referer", "referer");
      expected.set("remoteAddress", "72.140.152.122");
      expected.set("firstContactDatetime", "2023-11-05T10:30:00.000Z");
      expected.set("campaignContent", "campaignContent");
      expected.set("campaignMedium", "campaignMedium");
      expected.set("campaignName", "campaignName");
      expected.set("campaignSource", "campaignSource");
      expected.set("campaignTerm", "campaignTerm");
      expected.set("subscription[planCode]", "PLAN_CODE");
      expected.set("subscription[gatewayToken]", "GATEWAY_TOKEN");
      expected.set("subscription[method]", "cc");
      expected.set("subscription[initialBillDate]", "2023-11-05T10:30:00.000Z");
      expected.set("metaData[customer_id]", "cus_123456");
      expected.set("metaData[referrer_code]", "refer888");
      expected.set("metaData[subArray][item1]", "item1");

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });
  });

  test("parseItemQuantityData", () => {
    const data: ItemQuantityData = {
      quantity: 4.3232111,
      remoteAddress: "72.140.152.122",
    };
    const result = parseItemQuantityData(data);
    const expected = new URLSearchParams({
      quantity: "4.3232",
      remoteAddress: "72.140.152.122",
    });

    for (const [key] of Object.entries(expected)) {
      assert.strictEqual(expected[key], result[key]);
    }
  });

  test("parseSetItemQuantityData", () => {
    const data: SetItemQuantityData = {
      quantity: 4.3232111,
      remoteAddress: "72.140.152.122",
      invoicePeriod: "outstanding",
    };

    const result = parseSetItemQuantityData(data);
    const expected = new URLSearchParams({
      quantity: "4.3232",
      remoteAddress: "72.140.152.122",
      invoicePeriod: "outstanding",
    });

    for (const [key] of Object.entries(expected)) {
      assert.strictEqual(expected[key], result[key]);
    }
  });

  describe("parseAddCustomChargeData", () => {
    test("should parse the minimum required data", () => {
      const data: AddCustomChargeData = {
        chargeCode: "testCode",
        quantity: 2,
        eachAmount: 10.5,
      };

      const result = parseAddCustomChargeData(data);
      const expected = new URLSearchParams({
        chargeCode: "testCode",
        quantity: "2",
        eachAmount: "10.5",
      });

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });

    test("should parse all data including optional fields", () => {
      const data: AddCustomChargeData = {
        chargeCode: "fullCode",
        quantity: 1,
        eachAmount: -5.0,
        description: "Discount for loyal customer",
        invoicePeriod: "outstanding",
        remoteAddress: "192.168.1.100",
      };

      const result = parseAddCustomChargeData(data);
      const expected = new URLSearchParams({
        chargeCode: "fullCode",
        quantity: "1",
        eachAmount: "-5",
        description: "Discount for loyal customer",
        invoicePeriod: "outstanding",
        remoteAddress: "192.168.1.100",
      });

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });

    test("should handle integer amounts", () => {
      const data: AddCustomChargeData = {
        chargeCode: "intCode",
        quantity: 1,
        eachAmount: 10,
      };

      const expected = new URLSearchParams({
        chargeCode: "intCode",
        quantity: "1",
        eachAmount: "10",
      });

      const resultInt = parseAddCustomChargeData(data);

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], resultInt[key]);
      }
    });

    test("should handle float amounts", () => {
      const data: AddCustomChargeData = {
        chargeCode: "floatCode",
        quantity: 1,
        eachAmount: 9.99,
      };

      const expected = new URLSearchParams({
        chargeCode: "floatCode",
        quantity: "1",
        eachAmount: "9.99",
      });

      const result = parseAddCustomChargeData(data);

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });

    test("should not include undefined optional fields in the output", () => {
      const data: AddCustomChargeData = {
        chargeCode: "partialCode",
        quantity: 3,
        eachAmount: 2.75,
        description: "Limited time offer",
      };

      const expected = new URLSearchParams({
        chargeCode: "partialCode",
        quantity: "3",
        eachAmount: "2.75",
        description: "Limited time offer",
      });

      const result = parseAddCustomChargeData(data);

      for (const [key] of Object.entries(expected)) {
        assert.strictEqual(expected[key], result[key]);
      }
    });
  });

  describe("parseCreateOneTimeInvoiceData", () => {
    test("should parse a single charge with minimum data", () => {
      const data: CreateOneTimeInvoiceData = {
        charges: [
          {
            chargeCode: "charge1",
            quantity: 1,
            eachAmount: 10.0,
          },
        ],
      };
      const expected: Record<string, string> = {
        "charges[0][chargeCode]": "charge1",
        "charges[0][quantity]": "1",
        "charges[0][eachAmount]": "10",
      };
      assert.deepStrictEqual(parseCreateOneTimeInvoiceData(data), expected);
    });

    test("should parse multiple charges", () => {
      const data: CreateOneTimeInvoiceData = {
        charges: [
          { chargeCode: "charge1", quantity: 1, eachAmount: 10.0 },
          {
            chargeCode: "charge2",
            quantity: 2,
            eachAmount: 20.0,
            description: "Second charge",
          },
        ],
      };
      const expected: Record<string, string> = {
        "charges[0][chargeCode]": "charge1",
        "charges[0][quantity]": "1",
        "charges[0][eachAmount]": "10",
        "charges[1][chargeCode]": "charge2",
        "charges[1][quantity]": "2",
        "charges[1][eachAmount]": "20",
        "charges[1][description]": "Second charge",
      };
      assert.deepStrictEqual(parseCreateOneTimeInvoiceData(data), expected);
    });

    test("should handle zero quantity and amount", () => {
      const data: CreateOneTimeInvoiceData = {
        charges: [{ chargeCode: "zeroCharge", quantity: 0, eachAmount: 0 }],
      };
      const expected: Record<string, string> = {
        "charges[0][chargeCode]": "zeroCharge",
        "charges[0][quantity]": "0",
        "charges[0][eachAmount]": "0",
      };
      assert.deepStrictEqual(parseCreateOneTimeInvoiceData(data), expected);
    });

    test("should handle negative eachAmount", () => {
      const data: CreateOneTimeInvoiceData = {
        charges: [{ chargeCode: "credit", quantity: 1, eachAmount: -5.0 }],
      };
      const expected: Record<string, string> = {
        "charges[0][chargeCode]": "credit",
        "charges[0][quantity]": "1",
        "charges[0][eachAmount]": "-5",
      };
      assert.deepStrictEqual(parseCreateOneTimeInvoiceData(data), expected);
    });

    test("should include remoteAddress if provided", () => {
      const data: CreateOneTimeInvoiceData = {
        charges: [{ chargeCode: "charge1", quantity: 1, eachAmount: 10.0 }],
        remoteAddress: "192.0.2.1",
      };
      const expected: Record<string, string> = {
        "charges[0][chargeCode]": "charge1",
        "charges[0][quantity]": "1",
        "charges[0][eachAmount]": "10",
        remoteAddress: "192.0.2.1",
      };
      assert.deepStrictEqual(parseCreateOneTimeInvoiceData(data), expected);
    });

    test("should handle multiple charges with and without description", () => {
      const data: CreateOneTimeInvoiceData = {
        charges: [
          { chargeCode: "charge1", quantity: 1, eachAmount: 10.0 },
          {
            chargeCode: "charge2",
            quantity: 2,
            eachAmount: 20.0,
            description: "Description for charge 2",
          },
          { chargeCode: "charge3", quantity: 3, eachAmount: 30.0 },
        ],
        remoteAddress: "203.0.113.5",
      };
      const expected: Record<string, string> = {
        "charges[0][chargeCode]": "charge1",
        "charges[0][quantity]": "1",
        "charges[0][eachAmount]": "10",
        "charges[1][chargeCode]": "charge2",
        "charges[1][quantity]": "2",
        "charges[1][eachAmount]": "20",
        "charges[1][description]": "Description for charge 2",
        "charges[2][chargeCode]": "charge3",
        "charges[2][quantity]": "3",
        "charges[2][eachAmount]": "30",
        remoteAddress: "203.0.113.5",
      };
      assert.deepStrictEqual(parseCreateOneTimeInvoiceData(data), expected);
    });
  });

  describe("parseIssueRefundRequest", () => {
    test("should parse request with invoice ID", () => {
      const request: IssueRefundRequest = {
        idOrNumber: 12345,
        amount: 10.0,
      };
      const expected: Record<string, string> = {
        id: "12345",
        amount: "10",
      };
      assert.deepStrictEqual(parseIssueRefundRequest(request), expected);
    });

    test("should parse request with invoice number", () => {
      const request: IssueRefundRequest = {
        idOrNumber: "INV-001",
        amount: 25.5,
      };
      const expected: Record<string, string> = {
        number: "INV-001",
        amount: "25.5",
      };
      assert.deepStrictEqual(parseIssueRefundRequest(request), expected);
    });

    test("should parse request with remoteAddress", () => {
      const request: IssueRefundRequest = {
        idOrNumber: 67890,
        amount: 5.0,
        remoteAddress: "192.168.1.10",
      };
      const expected: Record<string, string> = {
        id: "67890",
        amount: "5",
        remoteAddress: "192.168.1.10",
      };
      assert.deepStrictEqual(parseIssueRefundRequest(request), expected);
    });

    test("should handle zero amount", () => {
      const request: IssueRefundRequest = {
        idOrNumber: "INV-002",
        amount: 0,
      };
      const expected: Record<string, string> = {
        number: "INV-002",
        amount: "0",
      };
      assert.deepStrictEqual(parseIssueRefundRequest(request), expected);
    });
  });
});

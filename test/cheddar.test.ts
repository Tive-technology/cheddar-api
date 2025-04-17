import assert from "node:assert/strict";
import test, { beforeEach, describe, it } from "node:test";
import config from "../config.json";
import { Cheddar } from "../src/cheddar.ts";
import { SubscriptionData } from "../src/types.ts";

describe("Cheddar", {}, () => {
  let cheddar: Cheddar;
  const customerCode = "customerCode1";

  beforeEach(() => {
    cheddar = new Cheddar(config);
  });

  describe("Pricing Plans", () => {
    describe("#getPlans", { skip: true }, () => {
      test("should return a plan array", async () => {
        const plans = await cheddar.getPlans();
        assert.ok(Array.isArray(plans), "plans should be an array");
        assert.ok(
          plans.length >= 1,
          "plans array should have at least one element"
        );
      });
    });

    describe("#getPlan", function () {
      test("should return a single plan", async () => {
        const plan = await cheddar.getPlan(config.planCode);
        assert.strictEqual(typeof plan, "object", "plan should be an object");
      });

      test("should return null if plan not found", async () => {
        const plan = await cheddar.getPlan("Bad Plan Code");
        assert.strictEqual(plan, null);
      });
    });
  });

  describe("Customers", () => {
    describe("#getCustomers", (t) => {
      test("should return an array of customers", async (t) => {
        const customers = await cheddar.getCustomers({});
        assert.ok(Array.isArray(customers), "customers should be an array");
        assert.ok(
          customers.length >= 1,
          "customers array should have at least one element"
        );
      });

      test("searching customers should return an array of customers", async (t) => {
        const customers = await cheddar.getCustomers({
          searchText: "test@example.com",
        });
        assert.ok(Array.isArray(customers), "customers should be an array");
        assert.ok(
          customers.length >= 1,
          "customers array should have at least one element"
        );
      });
    });

    describe("#getCustomer", (t) => {
      test("should return a valid customer", async (t) => {
        const customer = await cheddar.getCustomer(customerCode);
        assert.strictEqual(
          typeof customer,
          "object",
          "customer should be an object"
        );
      });

      test("should return null if customer not found", async (t) => {
        const customer = await cheddar.getCustomer("123sadsd12edsa");
        assert.strictEqual(customer, null);
      });
    });

    describe("#createCustomer", (t) => {
      test("it should create a customer", async (t) => {
        const subscriptionData: SubscriptionData = {
          planCode: config.planCode,
          method: "cc",
          ccNumber: "4111111111111111",
          ccExpiration: "12/2030",
          ccType: "visa",
          ccCardCode: "123",
          ccFirstName: "FName",
          ccLastName: "LName",
          ccZip: "95123",
        };
        const customer = await cheddar.createCustomer({
          code: customerCode,
          firstName: "FName",
          lastName: "LName",
          email: "test@example.com",
          subscription: subscriptionData,
        });
        assert.strictEqual(
          typeof customer,
          "object",
          "customer should be an object"
        );
      });
    });

    describe("#updateCustomer", (t) => {
      test("updates and returns customer", async (t) => {
        const customer = await cheddar.editCustomer({
          code: customerCode,
          firstName: "updatedFirstName",
        });
        assert.strictEqual(customer.firstName, "updatedFirstName");
      });
    });
  });

  describe("Subscriptions", () => {
    describe("#cancelSubscription", (t) => {
      test("cancels the customers subscription", async (t) => {
        const customer = await cheddar.cancelSubscription(customerCode);
        assert.strictEqual(customer._code, customerCode);
      });
    });

    describe("#editSubscription", (t) => {
      test("updates the customers subscription", async (t) => {
        const subscriptionData: SubscriptionData = {
          planCode: config.planCode,
          method: "cc",
          ccNumber: "4111111111111111",
          ccExpiration: "12/2030",
          ccType: "visa",
          ccCardCode: "123",
          ccFirstName: "FName",
          ccLastName: "LName",
          ccZip: "95123",
        };
        const customer = await cheddar.editSubscription({
          customerCode,
          ...subscriptionData,
        });
        assert.strictEqual(customer._code, customerCode);
        assert.strictEqual(customer, customerCode);
      });
    });
  });

  describe("Tracked Items", () => {});

  describe("Invoice Interactions", () => {});

  describe("Promotions", () => {});

  describe("#deleteCustomer", (t) => {
    test("should delete and return a valid customer", async (t) => {
      const customer = await cheddar.deleteCustomer(customerCode);
      assert.strictEqual(
        typeof customer,
        "object",
        "customer should be an object"
      );
    });
  });
});

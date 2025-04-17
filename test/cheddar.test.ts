import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
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
    describe("#getPlans", () => {
      it("should return a plan array", async () => {
        const plans = await cheddar.getPlans();
        console.log(plans);

        assert.ok(Array.isArray(plans), "plans should be an array");
        assert.ok(
          plans.length >= 1,
          "plans array should have at least one element"
        );
      });
    });

    describe("#getPlan", function () {
      it("should return a single plan", async () => {
        const plan = await cheddar.getPlan(config.planCode);
        assert.strictEqual(typeof plan, "object", "plan should be an object");
      });

      it("should return null if plan not found", async () => {
        const plan = await cheddar.getPlan("Bad Plan Code");
        console.log(plan);
        assert.strictEqual(plan, null);
      });
    });
  });

  describe("Customers", () => {
    describe("#getCustomers", (t) => {
      it("should return an array of customers", async (t) => {
        const customers = await cheddar.getCustomers({});
        console.log(customers);

        assert.ok(Array.isArray(customers), "customers should be an array");
        assert.ok(
          customers.length >= 1,
          "customers array should have at least one element"
        );
      });

      it("searching customers should return an array of customers", async (t) => {
        const customers = await cheddar.getCustomers({
          searchText: "test@example.com",
        });
        console.log(customers);

        assert.ok(Array.isArray(customers), "customers should be an array");
        assert.ok(
          customers.length >= 1,
          "customers array should have at least one element"
        );
      });
    });

    describe("#getCustomer", (t) => {
      it("should return a valid customer", async (t) => {
        const customer = await cheddar.getCustomer(customerCode);
        assert.strictEqual(
          typeof customer,
          "object",
          "customer should be an object"
        );
      });

      it("should return null if customer not found", async (t) => {
        const customer = await cheddar.getCustomer("123sadsd12edsa");
        console.log({ customer });
        assert.strictEqual(customer, null);
      });
    });

    describe("#createCustomer", (t) => {
      it("it should create a customer", async (t) => {
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
        console.log(customer);

        assert.strictEqual(
          typeof customer,
          "object",
          "customer should be an object"
        );
      });
    });

    describe("#updateCustomer", (t) => {
      it("updates and returns customer", async (t) => {
        const customer = await cheddar.editCustomer({
          code: customerCode,
          firstName: "updatedFirstName",
        });
        assert.strictEqual(customer.firstName, "updatedFirstName");
      });
    });

    describe("#deleteCustomer", (t) => {
      it("should delete and return a valid customer", async (t) => {
        const customer = await cheddar.deleteCustomer(customerCode);
        assert.strictEqual(
          typeof customer,
          "object",
          "customer should be an object"
        );
      });
    });
  });

  describe("Subscriptions", () => {});

  describe("Tracked Items", () => {});

  describe("Invoice Interactions", () => {});

  describe("Promotions", () => {});
});

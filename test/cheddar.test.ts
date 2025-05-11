import assert from "node:assert/strict";
import test, { beforeEach, describe } from "node:test";
import { Cheddar, type SubscriptionData } from "../src/index";

const {
  TEST_USERNAME,
  TEST_PASSWORD,
  TEST_PRODUCT_CODE,
  TEST_PLAN_CODE,
  TEST_ITEM_CODE,
  TEST_PROMO_CODE,
} = process.env;

describe("Cheddar", {}, () => {
  let cheddar: Cheddar;
  let customChargeId: string;
  const customerCode = "test-customer-code";

  beforeEach(() => {
    cheddar = new Cheddar({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
      productCode: TEST_PRODUCT_CODE,
    });
  });

  describe("Pricing Plans", () => {
    describe("#getPlans", () => {
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
        const plan = await cheddar.getPlan(TEST_PLAN_CODE);
        assert.strictEqual(plan?._code, TEST_PLAN_CODE);
      });

      test("should return null if plan not found", async () => {
        const plan = await cheddar.getPlan("Bad Plan Code");
        assert.strictEqual(plan, null);
      });
    });
  });

  describe("Customers", () => {
    describe("#createCustomer", () => {
      test("it should create a customer", async () => {
        const subscriptionData: SubscriptionData = {
          planCode: TEST_PLAN_CODE,
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
        assert.strictEqual(customer._code, customerCode);
        assert.strictEqual(customer.firstName, "FName");
        assert.strictEqual(customer.lastName, "LName");
        assert.strictEqual(customer.email, "test@example.com");
        assert.strictEqual(customer.subscriptions?.length, 1);
      });
    });

    describe("#getCustomers", () => {
      test("should return an array of customers", async () => {
        const customers = await cheddar.getCustomers({});
        assert.ok(Array.isArray(customers), "customers should be an array");
        assert.ok(
          customers.length >= 1,
          "customers array should have at least one element"
        );
      });

      test("searching customers should return an array of customers", async () => {
        const customers = await cheddar.getCustomers({
          search: "test@example.com",
        });
        assert.ok(Array.isArray(customers), "customers should be an array");
        assert.ok(
          customers.length >= 1,
          "customers array should have at least one element"
        );
      });
    });

    describe("#getCustomer", () => {
      test("should return a valid customer", async () => {
        const customer = await cheddar.getCustomer(customerCode);
        assert.strictEqual(customer?._code, customerCode);
      });

      test("should return null if customer not found", async () => {
        const customer = await cheddar.getCustomer("123sadsd12edsa");
        assert.strictEqual(customer, null);
      });
    });

    describe("#updateCustomer", () => {
      test("updates and returns customer", async () => {
        const customer = await cheddar.editCustomer({
          code: customerCode,
          firstName: "updatedFirstName",
        });
        assert.strictEqual(customer._code, customerCode);
        assert.strictEqual(customer.firstName, "updatedFirstName");
      });
    });
  });

  describe("Subscriptions", () => {
    describe("#cancelSubscription", () => {
      test("cancels the customers subscription", async () => {
        const customer = await cheddar.cancelSubscription(customerCode);
        assert.strictEqual(customer._code, customerCode);
      });
    });

    describe("#editSubscription", () => {
      test("updates the customers subscription", async () => {
        const subscriptionData: SubscriptionData = {
          planCode: TEST_PLAN_CODE,
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
        assert.strictEqual(
          customer.subscriptions![0].plans![0]._code,
          TEST_PLAN_CODE
        );
      });
    });
  });

  describe("Tracked Items", () => {
    describe("#addItem", () => {
      test("increments the tracked item by 3", async () => {
        const customer = await cheddar.addItem({
          customerCode,
          itemCode: TEST_ITEM_CODE,
          quantity: 3,
        });
        const item = customer.subscriptions![0].invoices![0].charges!.find(
          (charge) => charge._code === TEST_ITEM_CODE
        );
        assert.strictEqual(item!.quantity, 3);
      });
    });

    describe("#removeItem", () => {
      test("decrements the tracked item by 3", async () => {
        const customer = await cheddar.removeItem({
          customerCode,
          itemCode: TEST_ITEM_CODE,
          quantity: 3,
        });
        const item = customer.subscriptions![0].invoices![0].charges!.find(
          (charge) => charge._code === TEST_ITEM_CODE
        );
        assert.strictEqual(item!.quantity, 0);
      });
    });

    describe("#setItem", () => {
      test("decrements the tracked item by 3", async () => {
        const customer = await cheddar.setItem({
          customerCode,
          itemCode: TEST_ITEM_CODE,
          quantity: 8,
        });
        const item = customer.subscriptions![0].invoices![0].charges!.find(
          (charge) => charge._code === TEST_ITEM_CODE
        );
        assert.strictEqual(item!.quantity, 8);
      });
    });
  });

  describe("Invoice Interactions", () => {
    test("#addCustomCharge", async () => {
      const customer = await cheddar.addCustomCharge({
        customerCode,
        chargeCode: "CUSTOM",
        quantity: 4,
        eachAmount: 2.25,
      });
      const charges = customer.subscriptions![0].invoices![0].charges!;
      const charge = charges.find((charge) => charge._code === "CUSTOM")!;
      customChargeId = charge._id;
      assert.strictEqual(charge.quantity, 4);
      assert.strictEqual(charge.eachAmount, 2.25);
    });

    test("#deleteCustomCharge", async () => {
      const customer = await cheddar.deleteCustomCharge({
        customerCode,
        chargeId: customChargeId,
      });
      const charges = customer.subscriptions![0].invoices![0].charges!;
      const charge = charges.find((charge) => charge._code === "CUSTOM");
      assert.strictEqual(charge, undefined);
    });
  });

  describe("Promotions", () => {
    describe("#getPromotions", () => {
      test("gets all promotions", async () => {
        const promotions = await cheddar.getPromotions();
        assert.ok(Array.isArray(promotions));
      });

      test("gets valid promotion", async () => {
        const promotion = await cheddar.getPromotion(TEST_PROMO_CODE);
        assert.strictEqual(promotion!.coupons![0]._code, TEST_PROMO_CODE);
      });

      test("gets invalid promotion", async () => {
        const promotion = await cheddar.getPromotion("INVALID_CODE");
        assert.strictEqual(promotion, null);
      });
    });
  });

  describe("#deleteCustomer", () => {
    test("should delete and return a valid customer", async () => {
      const customer = await cheddar.deleteCustomer(customerCode);
      assert.strictEqual(
        typeof customer,
        "object",
        "customer should be an object"
      );
    });
  });
});

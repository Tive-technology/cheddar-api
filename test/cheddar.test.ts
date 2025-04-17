import assert from "assert/strict";
import { beforeEach, describe, it } from "node:test";

import config from "../config.json";
import { Cheddar } from "../src/cheddar.ts";
import { SubscriptionData } from "../src/types.ts";

describe("Cheddar", {}, () => {
  let cheddar: Cheddar;
  const customerCode1 = "customerCode1";
  const customerCode2 = "customerCode2";

  beforeEach(() => {
    cheddar = new Cheddar(config);
  });

  describe("Plans", { skip: true }, function () {
    describe("#getPlans", function () {
      it("should return a plan array", async function () {
        const plans = await cheddar.getPlans();
        console.log(plans);

        assert.ok(Array.isArray(plans), "plans should be an array");
        assert.ok(
          plans.length >= 1,
          "plans array should have at least one element",
        );
      });
    });

    describe("#getPlan", function () {
      it("should return a single plan", async function () {
        const plan = await cheddar.getPlan(config.planCode);
        assert.strictEqual(typeof plan, "object", "plan should be an object");
      });

      it("should fail on bad plan code", async function () {
        const plan = await cheddar.getPlan("Bad Plan Code");
        console.log(plan);
        assert.strictEqual(plan, null);
      });
    });
  });

  describe("customers", () => {
    describe("#createCustomer", { skip: true }, (t) => {
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
          code: customerCode1,
          firstName: "FName",
          lastName: "LName",
          email: "test@example.com",
          subscription: subscriptionData,
        });
        console.log(customer);

        assert.strictEqual(
          typeof customer,
          "object",
          "customer should be an object",
        );
      });
    });
  });
});

import assert from "assert/strict";
import { beforeEach, describe, it } from "node:test";

import config from "../config.json";
import { Cheddar } from "../src/cheddar.js";

async function sleep(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

describe("Cheddar", {}, () => {
  let cheddar: Cheddar;
  const customerCode1 = "customerCode1";
  const customerCode2 = "customerCode2";

  beforeEach(() => {
    cheddar = new Cheddar(config);
  });

  describe("Plans", function () {
    describe("#getPlans", function () {
      it("should return a plan array", async function () {
        const plans = await cheddar.getPlans();
        console.log(plans);

        assert.ok(Array.isArray(plans), "plans should be an array");
        assert.ok(
          plans.length >= 1,
          "plans array should have at least one element"
        );
      });
    });

    // describe("#getPlan", function () {
    //   it("should return a single plan", async function () {
    //     const plan = await cheddar.getPlan(config.planCode);

    //     assert.strictEqual(typeof plan, "object", "plan should be an object");
    //   });

    //   it("should fail on bad plan code", async function () {
    //     try {
    //       await this.cheddar.getPlan("Bad Plan Code");
    //       assert.fail("Should have thrown an error");
    //     } catch (err: any) {
    //       assert.ok(
    //         err.message.includes("Plan not found"),
    //         'error message should include "Plan not found"'
    //       );
    //     }
    //   });
    // });
  });

  // describe("customers", () => {
  //   describe("#createCustomer", (t) => {
  //     it("it should create a customer", async (t) => {
  //       const subscriptionData: SubscriptionData = {
  //         planCode: config.planCode,
  //         method: "cc",
  //         ccNumber: "4111111111111111",
  //         ccExpiration: "12/2020",
  //         ccCardCode: "123",
  //         ccFirstName: "FName",
  //         ccLastName: "LName",
  //         ccZip: "95123",
  //       };

  //       const customer = await cheddar.createCustomer({
  //         code: customerCode1,
  //         firstName: "FName",
  //         lastName: "LName",
  //         email: "test@example.com",
  //         subscription: subscriptionData,
  //       });
  //       console.log(customer);

  //       // Make sure the createdDatetime are different for each user
  //       await sleep(1000);

  //       const customer2 = await cheddar.createCustomer({
  //         code: customerCode2,
  //         firstName: "FName2",
  //         lastName: "LName2",
  //         email: "test2@example.com",
  //         subscription: subscriptionData,
  //       });
  //       console.log(customer2);

  //       // Make the customer is saved before continuing
  //       await sleep(1000);
  //       assert.ok(true);
  //     });
  //   });
  // });
});

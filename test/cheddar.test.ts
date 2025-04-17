import assert from "assert/strict";
import { beforeEach, describe, it } from "node:test";
import { Cheddar } from "../lib/cheddar.js";

import config from "../config.json";
import { SubscriptionData } from "../src/types.js";

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

  describe("customers", () => {
    describe("#createCustomer", (t) => {
      it("it should create a customer", async (t) => {
        const subscriptionData: SubscriptionData = {
          planCode: config.planCode,
          method: "cc",
          ccNumber: "4111111111111111",
          ccExpiration: "12/2020",
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

        // Make sure the createdDatetime are different for each user
        await sleep(1000);

        const customer2 = await cheddar.createCustomer({
          code: customerCode2,
          firstName: "FName2",
          lastName: "LName2",
          email: "test2@example.com",
          subscription: subscriptionData,
        });
        console.log(customer2);

        // Make the customer is saved before continuing
        await sleep(1000);
        assert.ok(true);
      });
    });
  });
});

import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { cheddarXmlParser } from "../src/xmlParsing.ts";

describe("XmlParser", () => {
  describe("Plans response", () => {
    test("plans.plan", () => {
      const result = cheddarXmlParser.parse(plansResponse);
      const plans = result.plans.plan;
      assert.ok(Array.isArray(plans));
    });

    test("plans.plan.items.item", () => {
      const result = cheddarXmlParser.parse(plansResponse);
      const plan = result.plans.plan[0];
      const items = plan.items.item;
      assert.ok(Array.isArray(items));
    });
  });

  describe("Customer response", () => {
    test("customers", () => {
      const result = cheddarXmlParser.parse(customerResponse);
      const customers = result.customers.customer;
      assert.ok(Array.isArray(customers));

      const customer = customers[0];
      assert.strictEqual(customer.firstName, "Joe");
    });

    test("customers.customer.subscriptions", () => {
      const result = cheddarXmlParser.parse(customerResponse);
      const customer = result.customers.customer[0];
      const subscriptions = customer.subscriptions.subscription;
      assert.ok(Array.isArray(subscriptions));
    });

    test("customers.customer.subscriptions.subscription.plans", () => {
      const result = cheddarXmlParser.parse(customerResponse);
      const customer = result.customers.customer[0];
      const subscription = customer.subscriptions.subscription[0];
      assert.ok(Array.isArray(subscription.plans.plan));
    });

    test("customers.customer.subscriptions.subscription.plans.plan.items", () => {
      const result = cheddarXmlParser.parse(customerResponse);
      const customer = result.customers.customer[0];
      const subscription = customer.subscriptions.subscription[0];
      const plan = subscription.plans.plan[0];
      assert.ok(Array.isArray(plan.items.item));
    });

    test("customers.customer.subscriptions.subscription.items", () => {
      const result = cheddarXmlParser.parse(customerResponse);
      const customer = result.customers.customer[0];
      const subscription = customer.subscriptions.subscription[0];
      assert.ok(Array.isArray(subscription.items.item));
    });

    test("customers.customer.subscriptions.subscription.invoices", () => {
      const result = cheddarXmlParser.parse(customerResponse);
      const customer = result.customers.customer[0];
      const subscription = customer.subscriptions.subscription[0];
      const invoices = subscription.invoices.invoice;
      assert.ok(Array.isArray(invoices));
    });

    test("customers.customer.subscriptions.subscription.invoices.invoice.charges", () => {
      const result = cheddarXmlParser.parse(customerResponse);
      const customer = result.customers.customer[0];

      const subscription = customer.subscriptions.subscription[0];
      const invoice = subscription.invoices.invoice[0];
      const charges = invoice.charges.charge;
      assert.ok(Array.isArray(charges));
    });

    test("customers.customer.subscriptions.subscription.invoices.invoice.transactions", () => {
      const result = cheddarXmlParser.parse(customerResponse);
      const customer = result.customers.customer[0];
      const subscription = customer.subscriptions.subscription[0];
      const invoice = subscription.invoices.invoice[1];
      const transactions = invoice.transactions.transaction;
      assert.ok(Array.isArray(transactions));
    });
  });

  describe("error response", () => {
    test("parses error result", () => {
      const result = cheddarXmlParser.parse(errorResponse);
      assert.strictEqual(result.error._$text, "Customer not found");
      assert.strictEqual(result.error._id, "73542");
      assert.strictEqual(result.error._code, "404");
      assert.strictEqual(result.error._auxCode, "");
    });
  });
});

// https://gist.githubusercontent.com/marcguyer/660077/raw/86551a5ec77b1c3b52c3ba8a4d68791fca897a8e/customers.xml
const customerResponse = `<?xml version="1.0" encoding="UTF-8"?>
<customers>
  <customer id="89fdd0e4-c775-11de-8728-40407c9117fd" code="test_customer">
    <firstName>Joe</firstName>
    <lastName>Schmoe</lastName>
    <company/>
    <email>joe.schmoe@example.com</email>
    <notes/>
    <gatewayToken>SIMULATED</gatewayToken>
    <isVatExempt>0</isVatExempt>
    <vatNumber/>
    <firstContactDatetime>2009-10-01T19:24:10+00:00</firstContactDatetime>
    <referer/>
    <refererHost/>
    <campaignSource/>
    <campaignMedium/>
    <campaignTerm/>
    <campaignContent/>
    <campaignName/>
    <createdDatetime>2009-11-02T06:04:10+00:00</createdDatetime>
    <modifiedDatetime>2009-11-02T06:04:10+00:00</modifiedDatetime>
    <metaData/>
    <subscriptions>
      <subscription id="7fc2f2e6-3e47-11df-8728-40407c9117fd">
        <plans>
          <plan id="e6eac5ee-e5e9-11df-86d5-40407c9117fd" code="PAID">
            <name>Paid</name>
            <description>This is a paid plan!</description>
            <isActive>1</isActive>
            <isFree>0</isFree>
            <trialDays>0</trialDays>
            <billingFrequency>monthly</billingFrequency>
            <billingFrequencyPer>month</billingFrequencyPer>
            <billingFrequencyUnit>months</billingFrequencyUnit>
            <billingFrequencyQuantity>1</billingFrequencyQuantity>
            <setupChargeCode>PAID_SETUP</setupChargeCode>
            <setupChargeAmount>0.00</setupChargeAmount>
            <recurringChargeCode>PAID_RECURRING</recurringChargeCode>
            <recurringChargeAmount>19.99</recurringChargeAmount>
            <createdDatetime>2009-11-01T18:57:40+00:00</createdDatetime>
            <items>
              <item id="e6ef5cee-e5e9-11df-86d5-40407c9117fd" code="PROJECTS">
                <name>Projects</name>
                <quantityIncluded>5</quantityIncluded>
                <isPeriodic>1</isPeriodic>
                <overageAmount>4.00</overageAmount>
                <createdDatetime>2009-11-01T18:57:41+00:00</createdDatetime>
              </item>
              <item id="e6ef5e60-e5e9-11df-86d5-40407c9117fd" code="USERS">
                <name>Users</name>
                <quantityIncluded>5</quantityIncluded>
                <isPeriodic>1</isPeriodic>
                <overageAmount>2.50</overageAmount>
                <createdDatetime>2009-11-01T18:57:41+00:00</createdDatetime>
              </item>
            </items>
          </plan>
        </plans>
        <gatewayToken>SIMULATED</gatewayToken>
        <gatewayAccount>
          <id>d6733a6e-44b3-11e1-a628-40403c39f8d9</id>
          <gateway>CheddarGateway_Simulator</gateway>
          <type>cc</type>
        </gatewayAccount>
        <ccFirstName>Joe</ccFirstName>
        <ccLastName>Schmoe</ccLastName>
        <ccCompany/>
        <ccCountry/>
        <ccAddress/>
        <ccCity/>
        <ccState/>
        <ccZip>90210</ccZip>
        <ccType>mc</ccType>
        <ccLastFour>0015</ccLastFour>
        <ccExpirationDate>2011-02-28T00:00:00+00:00</ccExpirationDate>
        <canceledDatetime/>
        <createdDatetime>2010-10-02T11:04:25+00:00</createdDatetime>
        <items>
          <item id="e6ef5cee-e5e9-11df-86d5-40407c9117fd" code="PROJECTS">
            <name>Projects</name>
            <quantity>3</quantity>
            <createdDatetime>2010-11-04T18:57:42+00:00</createdDatetime>
            <modifiedDatetime>2010-11-04T18:57:43+00:00</modifiedDatetime>
          </item>
          <item id="e6ef5e60-e5e9-11df-86d5-40407c9117fd" code="USERS">
            <name>Users</name>
            <quantity>8</quantity>
            <createdDatetime>2010-11-04T18:57:42+00:00</createdDatetime>
            <modifiedDatetime>2010-11-04T18:57:43+00:00</modifiedDatetime>
          </item>
        </items>
        <invoices>
          <invoice id="ab8fad6c-e6ab-11df-8728-40407c9117fd">
            <number>2658</number>
            <type>subscription</type>
            <vatRate/>
            <billingDatetime>2010-12-02T06:04:10+00:00</billingDatetime>
            <paidTransactionId/>
            <createdDatetime>2010-11-02T18:04:43+00:00</createdDatetime>
            <charges>
              <charge id="" code="PAID_RECURRING">
                <type>recurring</type>
                <quantity>1</quantity>
                <eachAmount>19.00</eachAmount>
                <description/>
                <createdDatetime>2010-12-02T06:04:10+00:00</createdDatetime>
              </charge>
              <charge id="" code="PROJECTS">
                <type>item</type>
                <quantity>0</quantity>
                <eachAmount>4.00</eachAmount>
                <description/>
                <createdDatetime/>
              </charge>
              <charge id="" code="USERS">
                <type>item</type>
                <quantity>3</quantity>
                <eachAmount>2.50</eachAmount>
                <description/>
                <createdDatetime/>
              </charge>
            </charges>
          </invoice>
          <invoice id="2535f824-ce47-11df-8728-40407c9117fd">
            <number>1635</number>
            <type>subscription</type>
            <vatRate/>
            <billingDatetime>2010-11-02T06:04:10+00:00</billingDatetime>
            <paidTransactionId>ab6aedd8-e6ab-11df-8728-40407c9117fd</paidTransactionId>
            <createdDatetime>2010-10-02T17:04:40+00:00</createdDatetime>
            <charges>
              <charge id="ab6992e4-e6ab-11df-8728-40407c9117fd" code="PAID_RECURRING">
                <type>recurring</type>
                <quantity>1</quantity>
                <eachAmount>19.00</eachAmount>
                <description/>
                <createdDatetime>2010-11-02T18:04:43+00:00</createdDatetime>
              </charge>
              <charge id="ab69884e-e6ab-11df-8728-40407c9117fd" code="USERS">
                <type>item</type>
                <quantity>3</quantity>
                <eachAmount>2.50</eachAmount>
                <description/>
                <createdDatetime>2010-11-02T18:04:43+00:00</createdDatetime>
              </charge>
            </charges>
            <transactions>
              <transaction id="ab6aedd8-e6ab-11df-8728-40407c9117fd" code="">
                <parentId/>
                <gatewayToken/>
                <gatewayAccount>
                  <id>d6733a6e-44b3-11e1-a628-40403c39f8d9</id>
                  <gateway>CheddarGateway_Simulator</gateway>
                  <type>cc</type>
                </gatewayAccount>
                <amount>26.50</amount>
                <memo>SIMULATED approved payment</memo>
                <response>approved</response>
                <responseReason/>
                <transactedDatetime>2010-11-02T18:04:43+00:00</transactedDatetime>
                <createdDatetime>2010-11-02T18:04:43+00:00</createdDatetime>
              </transaction>
            </transactions>
          </invoice>
        </invoices>
      </subscription>
      <subscription id="89feb4b4-c775-11de-8728-40407c9117fd">
        <plans>
          <plan id="e6eac530-e5e9-11df-86d5-40407c9117fd" code="FREE">
            <name>Free</name>
            <description>This one is free!</description>
            <isActive>1</isActive>
            <isFree>1</isFree>
            <trialDays>0</trialDays>
            <billingFrequency>monthly</billingFrequency>
            <billingFrequencyPer>month</billingFrequencyPer>
            <billingFrequencyUnit>months</billingFrequencyUnit>
            <billingFrequencyQuantity>1</billingFrequencyQuantity>
            <setupChargeCode>FREE_SETUP</setupChargeCode>
            <setupChargeAmount>0.00</setupChargeAmount>
            <recurringChargeCode>FREE_RECURRING</recurringChargeCode>
            <recurringChargeAmount>0.00</recurringChargeAmount>
            <createdDatetime>2010-11-01T18:57:40+00:00</createdDatetime>
            <items>
              <item id="e6ef5cee-e5e9-11df-86d5-40407c9117fd" code="PROJECTS">
                <name>Projects</name>
                <quantityIncluded>2</quantityIncluded>
                <isPeriodic>1</isPeriodic>
                <overageAmount>0.00</overageAmount>
                <createdDatetime>2010-11-01T18:57:41+00:00</createdDatetime>
              </item>
              <item id="e6ef5e60-e5e9-11df-86d5-40407c9117fd" code="USERS">
                <name>Users</name>
                <quantityIncluded>2</quantityIncluded>
                <isPeriodic>1</isPeriodic>
                <overageAmount>0.00</overageAmount>
                <createdDatetime>2010-11-01T18:57:41+00:00</createdDatetime>
              </item>
            </items>
          </plan>
        </plans>
        <gatewayToken>SIMULATED</gatewayToken>
        <gatewayAccount>
          <id>d6733a6e-44b3-11e1-a628-40403c39f8d9</id>
          <gateway>CheddarGateway_Simulator</gateway>
          <type>cc</type>
        </gatewayAccount>
        <ccFirstName>Joe</ccFirstName>
        <ccLastName>Schmoe</ccLastName>
        <ccCompany/>
        <ccCountry/>
        <ccAddress/>
        <ccCity/>
        <ccState/>
        <ccZip>90210</ccZip>
        <ccType>mc</ccType>
        <ccLastFour>0015</ccLastFour>
        <ccExpirationDate>2011-02-28T00:00:00+00:00</ccExpirationDate>
        <canceledDatetime/>
        <createdDatetime>2009-11-02T06:04:10+00:00</createdDatetime>
        <invoices>
          <invoice id="f87f6796-25e2-11df-8728-40407c9117fd">
            <number>524</number>
            <type>subscription</type>
            <vatRate/>
            <billingDatetime>2010-10-02T06:04:10+00:00</billingDatetime>
            <paidTransactionId>7ebb3eee-3e47-11df-8728-40407c9117fd</paidTransactionId>
            <createdDatetime>2010-09-02T10:04:20+00:00</createdDatetime>
            <charges>
              <charge id="7eb9bdf8-3e47-11df-8728-40407c9117fd" code="FREE_RECURRING">
                <type>recurring</type>
                <quantity>1</quantity>
                <eachAmount>0.00</eachAmount>
                <description/>
                <createdDatetime>2010-10-02T11:04:23+00:00</createdDatetime>
              </charge>
            </charges>
            <transactions>
              <transaction id="7ebb3eee-3e47-11df-8728-40407c9117fd" code="">
                <parentId/>
                <gatewayToken/>
                <gatewayAccount>
                  <id>d6733a6e-44b3-11e1-a628-40403c39f8d9</id>
                  <gateway>CheddarGateway_Simulator</gateway>
                  <type>cc</type>
                </gatewayAccount>
                <amount>0.00</amount>
                <memo>SIMULATED approved payment</memo>
                <response>approved</response>
                <responseReason/>
                <transactedDatetime>2010-10-02T11:04:23+00:00</transactedDatetime>
                <createdDatetime>2010-10-02T11:04:23+00:00</createdDatetime>
              </transaction>
            </transactions>
          </invoice>
        </invoices>
      </subscription>
    </subscriptions>
  </customer>
</customers>`;

const plansResponse = `<?xml version="1.0" encoding="UTF-8"?>
<plans>
  <plan id="e6eac530-e5e9-11df-86d5-40407c9117fd" code="FREE">
    <name>Free</name>
    <description>This one is free!</description>
    <isActive>1</isActive>
    <isFree>1</isFree>
    <trialDays>0</trialDays>
    <billingFrequency>monthly</billingFrequency>
    <billingFrequencyPer>month</billingFrequencyPer>
    <billingFrequencyUnit>months</billingFrequencyUnit>
    <billingFrequencyQuantity>1</billingFrequencyQuantity>
    <setupChargeCode>FREE_SETUP</setupChargeCode>
    <setupChargeAmount>0.00</setupChargeAmount>
    <recurringChargeCode>FREE_RECURRING</recurringChargeCode>
    <recurringChargeAmount>0.00</recurringChargeAmount>
    <createdDatetime>2010-11-01T18:57:40+00:00</createdDatetime>
    <items>
      <item id="e6ef5cee-e5e9-11df-86d5-40407c9117fd" code="PROJECTS">
        <name>Projects</name>
        <quantityIncluded>2</quantityIncluded>
        <isPeriodic>1</isPeriodic>
        <overageAmount>0.00</overageAmount>
        <createdDatetime>2010-11-01T18:57:41+00:00</createdDatetime>
      </item>
      <item id="e6ef5e60-e5e9-11df-86d5-40407c9117fd" code="USERS">
        <name>Users</name>
        <quantityIncluded>2</quantityIncluded>
        <isPeriodic>1</isPeriodic>
        <overageAmount>0.00</overageAmount>
        <createdDatetime>2010-11-01T18:57:41+00:00</createdDatetime>
      </item>
    </items>
  </plan>
  <plan id="e6eac5ee-e5e9-11df-86d5-40407c9117fd" code="PAID">
    <name>Paid</name>
    <description>This is a paid plan!</description>
    <isActive>1</isActive>
    <isFree>0</isFree>
    <trialDays>0</trialDays>
    <billingFrequency>monthly</billingFrequency>
    <billingFrequencyPer>month</billingFrequencyPer>
    <billingFrequencyUnit>months</billingFrequencyUnit>
    <billingFrequencyQuantity>1</billingFrequencyQuantity>
    <setupChargeCode>PAID_SETUP</setupChargeCode>
    <setupChargeAmount>0.00</setupChargeAmount>
    <recurringChargeCode>PAID_RECURRING</recurringChargeCode>
    <recurringChargeAmount>19.99</recurringChargeAmount>
    <createdDatetime>2010-11-01T18:57:40+00:00</createdDatetime>
    <items>
      <item id="e6ef5cee-e5e9-11df-86d5-40407c9117fd" code="PROJECTS">
        <name>Projects</name>
        <quantityIncluded>5</quantityIncluded>
        <isPeriodic>1</isPeriodic>
        <overageAmount>4.00</overageAmount>
        <createdDatetime>2010-11-01T18:57:41+00:00</createdDatetime>
      </item>
      <item id="e6ef5e60-e5e9-11df-86d5-40407c9117fd" code="USERS">
        <name>Users</name>
        <quantityIncluded>5</quantityIncluded>
        <isPeriodic>1</isPeriodic>
        <overageAmount>2.50</overageAmount>
        <createdDatetime>2010-11-01T18:57:41+00:00</createdDatetime>
      </item>
    </items>
  </plan>
</plans>`;

const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<error id="73542" code="404" auxCode="">Customer not found</error>`;

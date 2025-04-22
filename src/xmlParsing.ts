import { XMLParser } from "fast-xml-parser";
import { CheddarError, ErrorType } from "./types";

const alwaysArray = [
  "plans.plan",
  "plans.plan.items.item",
  "customers.customer",
  "customers.customer.subscriptions.subscription",
  "customers.customer.subscriptions.subscription.plans.plan",
  "customers.customer.subscriptions.subscription.plans.plan.items.item",
  "customers.customer.subscriptions.subscription.items.item",
  "customers.customer.subscriptions.subscription.invoices.invoice",
  "customers.customer.subscriptions.subscription.invoices.invoice.charges.charge",
  "customers.customer.subscriptions.subscription.invoices.invoice.transactions.transaction",
  "promotions.promotion",
  "promotions.promotion.incentives.incentive",
  "promotions.promotion.coupons.coupon",
];

export const cheddarXmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "_",
  textNodeName: "_$text",
  isArray: (tagName, jPath, isLeafNode, isAttribute) => {
    return alwaysArray.includes(jPath);
  },
  ignoreDeclaration: true,
});

export function parseResult<T>(xml: string): T {
  return cheddarXmlParser.parse(xml);
}

export function handleXmlError(text: string): CheddarError {
  if (!text.startsWith("<?xml")) {
    return new CheddarError("unknown", 500, "Unknown error");
  }

  const { error } = parseResult<ErrorType>(text);
  return new CheddarError(
    error._id,
    Number(error._code),
    error._$text,
    error._auxCode
  );
}

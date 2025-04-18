import { XMLParser } from "fast-xml-parser";

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

export function handleXmlError(err: any) {
  if (typeof err.error === "string" && err.error.indexOf("<?xml") === 0) {
    const { error } = parseResult<{
      error: {
        _$text: string;
        _id: string;
        _code: string;
        _auxCode: string;
      };
    }>(err.error);
    throw Error(`code: ${error._code} message: ${error._$text}`);
  }
  throw err;
}

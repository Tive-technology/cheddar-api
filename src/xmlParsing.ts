import { XMLParser } from "fast-xml-parser";

const arrays = [
  "plans",
  "customers",
  "items",
  "charges",
  "invoices",
  "subscriptions",
  "transactions",
  "promotions",
  "coupons",
  "incentives",
  "errors",
];

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "_",
  isArray: (
    tagName: string,
    jPath: string,
    isLeafNode: boolean,
    isAttribute: boolean
  ) => arrays.includes(tagName),
});

export function parseResult<T>(value: any): T {
  return xmlParser.parse(value);
}

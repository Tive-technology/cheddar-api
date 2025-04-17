"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResult = parseResult;
const fast_xml_parser_1 = require("fast-xml-parser");
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
const xmlParser = new fast_xml_parser_1.XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "_",
    isArray: (tagName, jPath, isLeafNode, isAttribute) => arrays.includes(tagName),
});
function parseResult(value) {
    return xmlParser.parse(value);
}

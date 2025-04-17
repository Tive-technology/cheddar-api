import { XMLParser } from "fast-xml-parser";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "_",
});

export function parseResult<T>(xml: string): T {
  return xmlParser.parse(xml);
}

export function handleXmlError(err: any) {
  if (typeof err.error === "string" && err.error.indexOf("<?xml") === 0) {
    return parseResult(err.error);
  }
  throw err;
}

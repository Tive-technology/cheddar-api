import {
  type AddCustomChargeData,
  type ChargeData,
  type CreateCustomerRequest,
  type CreateOneTimeInvoiceData,
  type Customer,
  type CustomersXmlResult,
  type EditCustomerData,
  type EditCustomerSubscriptionData,
  type GetCustomersRequest,
  type IssueRefundRequest,
  type IssueVoidRequest,
  type ItemData,
  type ItemQuantityData,
  type Plan,
  type PlansXmlResult,
  type Promotion,
  type PromotionsXmlResult,
  type SetItemQuantityData,
  type SubscriptionData,
} from "./types";
import { formatDateYYYY_MM_DD, removeEmptyStrings } from "./utils";

export function customersParser(response: CustomersXmlResult): Customer[] {
  return response.customers.customer.map((customer) =>
    removeEmptyStrings({
      ...customer,
      subscriptions: customer.subscriptions?.subscription?.map((subscription) =>
        removeEmptyStrings({
          ...subscription,
          invoices: subscription.invoices?.invoice.map((invoice) =>
            removeEmptyStrings({
              ...invoice,
              charges: invoice.charges?.charge?.map((charge) =>
                removeEmptyStrings(charge),
              ),
              transactions: invoice.transactions?.transaction?.map(
                (transaction) => removeEmptyStrings(transaction),
              ),
            }),
          ),
          plans: subscription.plans?.plan.map((plan) =>
            removeEmptyStrings({
              ...plan,
              items: plan.items?.item?.map((item) => removeEmptyStrings(item)),
            }),
          ),
          items: subscription.items?.item?.map((item) =>
            removeEmptyStrings(item),
          ),
        }),
      ),
    }),
  );
}

export function plansParser(response: PlansXmlResult): Plan[] {
  return response.plans.plan.map((plan) =>
    removeEmptyStrings({
      ...plan,
      items: plan.items?.item.map((item) => removeEmptyStrings(item)),
    }),
  );
}

export function promotionsParser(response: PromotionsXmlResult): Promotion[] {
  return response.promotions.promotion.map((promotion) =>
    removeEmptyStrings({
      ...promotion,
      incentives: promotion.incentives?.incentive.map((incentive) =>
        removeEmptyStrings(incentive),
      ),
      coupons: promotion.coupons?.coupon.map((coupon) =>
        removeEmptyStrings(coupon),
      ),
    }),
  );
}

export function parseGetCustomersRequest(
  request: GetCustomersRequest,
): URLSearchParams {
  const params = new URLSearchParams();
  const dateFields = [
    "createdBeforeDate",
    "createdAfterDate",
    "canceledBeforeDate",
    "canceledAfterDate",
    "transactedBeforeDate",
    "transactedAfterDate",
  ];

  for (const key in request) {
    const value = request[key as keyof GetCustomersRequest];

    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const code of value) {
        params.append(key, code);
      }
    } else if (dateFields.includes(key) && value instanceof Date) {
      params.set(key, formatDateYYYY_MM_DD(value));
    } else {
      params.set(key, String(value));
    }
  }

  return params;
}

export function parseCreateCustomerRequest(
  request: CreateCustomerRequest,
): URLSearchParams {
  const {
    firstContactDatetime,
    subscription,
    charges,
    items,
    metaData,
    ...data
  } = request;

  const params = new URLSearchParams();

  // Add basic fields
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }

  // Add subscription data
  if (subscription) {
    const subParams = parseSubscriptionData(subscription);
    for (const [key, value] of Object.entries(subParams)) {
      params.set(key, value);
    }
  }

  // Add charges
  if (charges) {
    const chargeParams = parseChargesData(charges);
    for (const [key, value] of Object.entries(chargeParams)) {
      params.set(key, value);
    }
  }

  // Add items
  if (items) {
    const itemParams = parseItemsData(items);
    for (const [key, value] of Object.entries(itemParams)) {
      params.set(key, value);
    }
  }

  // Add metadata
  if (metaData) {
    flattenMetaDataUrlParams(params, "metaData", metaData);
  }

  // Add firstContactDatetime
  if (firstContactDatetime) {
    params.set(
      "firstContactDatetime",
      formatDateYYYY_MM_DD(firstContactDatetime),
    );
  }

  return params;
}

export function parseCustomerAndSubscriptionData(
  request: EditCustomerSubscriptionData,
): URLSearchParams {
  const baseFields = [
    "gatewayToken",
    "firstName",
    "lastName",
    "email",
    "company",
    "notes",
    "taxNumber",
    "referer",
    "remoteAddress",
    "campaignContent",
    "campaignMedium",
    "campaignName",
    "campaignSource",
    "campaignTerm",
  ];

  const params = parseParamsFromObject(request, baseFields);
  if (request.taxRate !== undefined) {
    params.set("taxRate", request.taxRate.toString());
  }
  if (request.isTaxExempt !== undefined) {
    params.set("isTaxExempt", request.isTaxExempt ? "1" : "0");
  }
  if (request.firstContactDatetime) {
    params.set(
      "firstContactDatetime",
      request.firstContactDatetime.toISOString(),
    );
  }
  if (request.metaData) {
    flattenMetaDataUrlParams(params, "metaData", request.metaData);
  }
  if (request.subscription) {
    const parsed = parseSubscriptionData(request.subscription);
    for (const [key, value] of Object.entries(parsed)) {
      params.set(key, value);
    }
  }

  return params;
}

export function parseItemQuantityData(data: ItemQuantityData): URLSearchParams {
  const params = new URLSearchParams();
  if (data.quantity) {
    params.set("quantity", data.quantity.toFixed(4));
  }
  if (data.remoteAddress) {
    params.set("remoteAddress", data.remoteAddress);
  }
  return params;
}

export function parseSetItemQuantityData(
  data: SetItemQuantityData,
): URLSearchParams {
  const params = new URLSearchParams();
  if (data.quantity !== undefined) {
    params.set("quantity", data.quantity.toFixed(4));
  }
  if (data.remoteAddress) {
    params.set("remoteAddress", data.remoteAddress);
  }
  if (data.invoicePeriod) {
    params.set("invoicePeriod", data.invoicePeriod);
  }
  return params;
}

export function parseEditCustomerData(data: EditCustomerData): URLSearchParams {
  const basicFields = [
    "firstName",
    "lastName",
    "email",
    "company",
    "taxNumber",
    "referer",
    "remoteAddress",
    "campaignContent",
    "campaignMedium",
    "campaignName",
    "campaignSource",
    "campaignTerm",
  ];

  const params = parseParamsFromObject(data, basicFields);

  if (data.taxRate !== undefined)
    params.set("taxRate", data.taxRate.toString());
  if (data.isTaxExempt !== undefined)
    params.set("isTaxExempt", data.isTaxExempt ? "1" : "0");
  if (data.firstContactDatetime) {
    params.set("firstContactDatetime", data.firstContactDatetime.toISOString());
  }
  if (data.metaData) {
    flattenMetaDataUrlParams(params, "metaData", data.metaData);
  }

  return params;
}

export function parseAddCustomChargeData(
  data: AddCustomChargeData,
): URLSearchParams {
  const params = new URLSearchParams();

  params.set("chargeCode", data.chargeCode);
  params.set("quantity", data.quantity.toString());
  params.set("eachAmount", data.eachAmount.toString());

  if (data.description) {
    params.set("description", data.description);
  }
  if (data.invoicePeriod) {
    params.set("invoicePeriod", data.invoicePeriod);
  }
  if (data.remoteAddress) {
    params.set("remoteAddress", data.remoteAddress);
  }

  return params;
}

export function parseCreateOneTimeInvoiceData(
  data: CreateOneTimeInvoiceData,
): URLSearchParams {
  const params = new URLSearchParams();

  if (data.charges && data.charges.length > 0) {
    data.charges.forEach((charge, index) => {
      params.set(`charges[${index}][chargeCode]`, charge.chargeCode);
      params.set(`charges[${index}][quantity]`, charge.quantity.toString());
      params.set(`charges[${index}][eachAmount]`, charge.eachAmount.toString());
      if (charge.description) {
        params.set(`charges[${index}][description]`, charge.description);
      }
    });
  }
  if (data.remoteAddress) {
    params.set("remoteAddress", data.remoteAddress);
  }
  return params;
}

export function parseIssueVoidRequest(
  request: IssueVoidRequest,
): URLSearchParams {
  const params = new URLSearchParams();

  if (typeof request.idOrNumber === "number") {
    params.set("id", request.idOrNumber.toString());
  } else {
    params.set("number", request.idOrNumber);
  }

  if (request.remoteAddress) {
    params.set("remoteAddress", request.remoteAddress);
  }

  return params;
}

export function parseIssueRefundRequest(
  request: IssueRefundRequest,
): URLSearchParams {
  const params = parseIssueVoidRequest(request);
  params.set("amount", request.amount.toString());
  return params;
}

export function parseSubscriptionData(
  subscription: SubscriptionData,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(subscription).map(([key, value]) => [
      `subscription[${key}]`,
      value instanceof Date ? value.toISOString() : value,
    ]),
  );
}

function parseChargesData(charges: ChargeData[]): Record<string, string> {
  return charges.reduce(
    (combinedCharges, charge) => {
      for (const key in charge) {
        const value = charge[key as keyof ChargeData];
        if (value) {
          combinedCharges[`charges[${charge.chargeCode}][${key}]`] =
            String(value);
        }
      }
      return combinedCharges;
    },
    {} as Record<string, string>,
  );
}

function parseItemsData(items: ItemData[]): Record<string, string> {
  return items.reduce(
    (combinedItems, items) => {
      for (const key in items) {
        const value = items[key as keyof ItemData];
        if (value) {
          combinedItems[`items[${items.itemCode}][${key}]`] = String(value);
        }
      }
      return combinedItems;
    },
    {} as Record<string, string>,
  );
}

function flattenMetaData(obj: any, path: string, result: Record<string, any>) {
  for (const key in obj) {
    const value = obj[key];
    const fullPath = `${path}[${key}]`;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flattenMetaData(value, fullPath, result);
    } else {
      result[fullPath] = value;
    }
  }
}

function flattenMetaDataUrlParams(
  params: URLSearchParams,
  path: string,
  metadata: Record<string, any>,
) {
  for (const key in metadata) {
    const value = metadata[key];
    const fullPath = `${path}[${key}]`;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flattenMetaDataUrlParams(params, fullPath, value);
    } else {
      params.append(fullPath, String(value));
    }
  }
}

function parseParamsFromObject(
  obj: Record<string, any>,
  fields: string[],
): URLSearchParams {
  const params = new URLSearchParams();

  for (const key of fields) {
    const value = obj[key];
    if (value === undefined || value === null) continue;

    params.set(
      key,
      value instanceof Date ? value.toISOString() : String(value),
    );
  }

  return params;
}

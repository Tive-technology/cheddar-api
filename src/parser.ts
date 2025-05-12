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

export function parseCreateCustomerRequest(request: CreateCustomerRequest) {
  const { firstContactDatetime, subscription, charges, items, ...data } =
    request;
  const params: Record<string, any> = {
    ...data,
    ...(subscription && parseSubscriptionData(subscription)),
    ...(charges && parseChargesData(charges)),
    ...(items && parseItemsData(items)),
  };

  if (firstContactDatetime) {
    params.firstContactDatetime = formatDateYYYY_MM_DD(firstContactDatetime);
  }

  return params;
}

export function parseCustomerAndSubscriptionData(
  request: EditCustomerSubscriptionData,
) {
  const params = new URLSearchParams();
  if (request.gatewayToken) {
    params.set("gatewayToken", request.gatewayToken);
  }
  if (request.firstName) {
    params.set("firstName", request.firstName);
  }
  if (request.lastName) {
    params.set("lastName", request.lastName);
  }
  if (request.email) {
    params.set("email", request.email);
  }
  if (request.company) {
    params.set("company", request.company);
  }
  if (request.notes) {
    params.set("notes", request.notes);
  }
  if (request.taxRate !== undefined) {
    params.set("taxRate", request.taxRate.toString());
  }
  if (request.isTaxExempt !== undefined) {
    params.set("isTaxExempt", request.isTaxExempt ? "1" : "0");
  }
  if (request.taxNumber) {
    params.set("taxNumber", request.taxNumber);
  }
  if (request.firstContactDatetime) {
    params.set(
      "firstContactDatetime",
      request.firstContactDatetime.toISOString(),
    );
  }
  if (request.referer) {
    params.set("referer", request.referer);
  }
  if (request.remoteAddress) {
    params.set("remoteAddress", request.remoteAddress);
  }
  if (request.firstContactDatetime) {
    params.set(
      "firstContactDatetime",
      request.firstContactDatetime.toISOString(),
    );
  }
  if (request.campaignContent) {
    params.set("campaignContent", request.campaignContent);
  }
  if (request.campaignMedium) {
    params.set("campaignMedium", request.campaignMedium);
  }
  if (request.campaignName) {
    params.set("campaignName", request.campaignName);
  }
  if (request.campaignSource) {
    params.set("campaignSource", request.campaignSource);
  }
  if (request.campaignTerm) {
    params.set("campaignTerm", request.campaignTerm);
  }
  if (request.metaData) {
    for (const key in request.metaData) {
      if (Object.prototype.hasOwnProperty.call(request.metaData, key)) {
        params.set(`metaData[${key}]`, request.metaData[key]);
      }
    }
  }
  if (request.subscription) {
    const parsed = parseSubscriptionData(request.subscription);
    for (const [key, value] of Object.entries(parsed)) {
      params.set(key, value);
    }
  }
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

export function parseItemQuantityData(
  data: ItemQuantityData,
): Record<string, string> {
  const result: Record<string, string> = {};
  if (data.quantity) {
    result.quantity = data.quantity.toFixed(4);
  }
  if (data.remoteAddress) {
    result.remoteAddress = data.remoteAddress;
  }
  return result;
}

export function parseSetItemQuantityData(
  data: SetItemQuantityData,
): Record<string, string> {
  const result: Record<string, string> = {};
  if (data.quantity) {
    result.quantity = data.quantity.toFixed(4);
  }
  if (data.remoteAddress) {
    result.remoteAddress = data.remoteAddress;
  }
  if (data.invoicePeriod) {
    result.invoicePeriod = data.invoicePeriod;
  }
  return result;
}

export function parseEditCustomerData(data: EditCustomerData): URLSearchParams {
  const params = new URLSearchParams();
  if (data.firstName) {
    params.set("firstName", data.firstName);
  }
  if (data.lastName) {
    params.set("lastName", data.lastName);
  }
  if (data.email) {
    params.set("email", data.email);
  }
  if (data.company) {
    params.set("company", data.company);
  }
  if (data.taxRate !== undefined) {
    params.set("taxRate", data.taxRate.toString());
  }
  if (data.isTaxExempt !== undefined) {
    params.set("isTaxExempt", data.isTaxExempt ? "1" : "0");
  }
  if (data.taxNumber) {
    params.set("taxNumber", data.taxNumber);
  }
  if (data.referer) {
    params.set("referer", data.referer);
  }
  if (data.remoteAddress) {
    params.set("remoteAddress", data.remoteAddress);
  }
  if (data.firstContactDatetime) {
    params.set("firstContactDatetime", data.firstContactDatetime.toISOString());
  }
  if (data.campaignContent) {
    params.set("campaignContent", data.campaignContent);
  }
  if (data.campaignMedium) {
    params.set("campaignMedium", data.campaignMedium);
  }
  if (data.campaignName) {
    params.set("campaignName", data.campaignName);
  }
  if (data.campaignSource) {
    params.set("campaignSource", data.campaignSource);
  }
  if (data.campaignTerm) {
    params.set("campaignTerm", data.campaignTerm);
  }
  if (data.metaData) {
    for (const key in data.metaData) {
      if (Object.prototype.hasOwnProperty.call(data.metaData, key)) {
        params.set(`metaData[${key}]`, data.metaData[key]);
      }
    }
  }
  return params;
}

export function parseAddCustomChargeData(
  data: AddCustomChargeData,
): Record<string, string> {
  const params: Record<string, string> = {};
  params.chargeCode = data.chargeCode;
  params.quantity = data.quantity.toString();
  params.eachAmount = data.eachAmount.toString();
  if (data.description) {
    params.description = data.description;
  }
  if (data.invoicePeriod) {
    params.invoicePeriod = data.invoicePeriod;
  }
  if (data.remoteAddress) {
    params.remoteAddress = data.remoteAddress;
  }
  return params;
}

export function parseCreateOneTimeInvoiceData(
  data: CreateOneTimeInvoiceData,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (data.charges && data.charges.length > 0) {
    data.charges.forEach((charge, index) => {
      params[`charges[${index}][chargeCode]`] = charge.chargeCode;
      params[`charges[${index}][quantity]`] = charge.quantity.toString();
      params[`charges[${index}][eachAmount]`] = charge.eachAmount.toString();
      if (charge.description) {
        params[`charges[${index}][description]`] = charge.description;
      }
    });
  }
  if (data.remoteAddress) {
    params["remoteAddress"] = data.remoteAddress;
  }
  return params;
}

export function parseIssueVoidRequest(
  request: IssueVoidRequest,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (typeof request.idOrNumber === "number") {
    params.id = request.idOrNumber.toString();
  } else {
    params.number = request.idOrNumber;
  }

  if (request.remoteAddress) {
    params.remoteAddress = request.remoteAddress;
  }

  return params;
}

export function parseIssueRefundRequest(
  request: IssueRefundRequest,
): Record<string, string> {
  const params: Record<string, string> = parseIssueVoidRequest(request);

  params.amount = request.amount.toString();

  return params;
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

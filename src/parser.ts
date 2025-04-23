import {
  ChargeData,
  CreateCustomerRequest,
  Customer,
  CustomersXmlParseResult,
  GetCustomersRequest,
  ItemData,
  Plan,
  PlansXmlParseResult,
  Promotion,
  PromotionsXmlParseResult,
  SubscriptionData,
} from "./types";
import { formatDateYYYY_MM_DD } from "./utils";

export function customersParser(response: CustomersXmlParseResult): Customer[] {
  return response.customers.customer.map((customer) => ({
    ...customer,
    subscriptions: customer.subscriptions?.subscription?.map(
      (subscription) => ({
        ...subscription,
        invoices: subscription.invoices?.invoice.map((invoice) => ({
          ...invoice,
          charges: invoice.charges?.charge,
          transactions: invoice.transactions?.transaction,
        })),
        plans: subscription.plans?.plan.map((plan) => ({
          ...plan,
          items: plan.items?.item,
        })),
        items: subscription.items?.item,
      })
    ),
  }));
}

export function plansParser(response: PlansXmlParseResult): Plan[] {
  return response.plans.plan.map((plan) => ({
    ...plan,
    items: plan.items?.item,
  }));
}

export function promotionsParser(
  response: PromotionsXmlParseResult
): Promotion[] {
  return response.promotions.promotion.map((promotion) => ({
    ...promotion,
    incentives: promotion.incentives?.incentive,
    coupons: promotion.coupons?.coupon,
  }));
}

export function parseGetCustomersRequest(
  request: GetCustomersRequest
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
    const value = request[key];

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

export function parseSubscriptionData(subscription: SubscriptionData) {
  return Object.fromEntries(
    Object.entries(subscription).map(([key, value]) => [
      `subscription[${key}]`,
      value,
    ])
  );
}

function parseChargesData(charges: ChargeData[]) {
  return charges.reduce((combinedCharges, charge) => {
    for (const key in charge) {
      combinedCharges[`charges[${charge.chargeCode}][${key}]`] = charge[key];
    }
    return combinedCharges;
  }, {});
}

function parseItemsData(items: ItemData[]) {
  return items.reduce((combinedItems, items) => {
    for (const key in items) {
      combinedItems[`items[${items.itemCode}][${key}]`] = items[key];
    }
    return combinedItems;
  }, {});
}

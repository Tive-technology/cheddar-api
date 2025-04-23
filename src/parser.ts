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
): Record<string, any> {
  const params: Record<string, any> = { ...request };
  const {
    createdBeforeDate,
    createdAfterDate,
    canceledBeforeDate,
    canceledAfterDate,
    transactedBeforeDate,
    transactedAfterDate,
  } = request;

  if (createdBeforeDate) {
    params.createdBeforeDate = formatDateYYYY_MM_DD(createdBeforeDate);
  }
  if (createdAfterDate) {
    params.createdAfterDate = formatDateYYYY_MM_DD(createdAfterDate);
  }
  if (canceledBeforeDate) {
    params.canceledBeforeDate = formatDateYYYY_MM_DD(canceledBeforeDate);
  }
  if (canceledAfterDate) {
    params.canceledAfterDate = formatDateYYYY_MM_DD(canceledAfterDate);
  }
  if (transactedBeforeDate) {
    params.transactedBeforeDate = formatDateYYYY_MM_DD(transactedBeforeDate);
  }
  if (transactedAfterDate) {
    params.transactedAfterDate = formatDateYYYY_MM_DD(transactedAfterDate);
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

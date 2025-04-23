import {
  Customer,
  CustomersXmlParseResult,
  GetCustomersRequest,
  Plan,
  PlansXmlParseResult,
  Promotion,
  PromotionsXmlParseResult,
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

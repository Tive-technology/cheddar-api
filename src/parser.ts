import {
  Customer,
  CustomersXmlParseResult,
  Plan,
  PlansXmlParseResult,
  Promotion,
  PromotionsXmlParseResult,
} from "./types";

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

export function promotionsParser(response: PromotionsXmlParseResult): Promotion[] {
  return response.promotions.promotion.map((promotion) => ({
    ...promotion,
    incentives: promotion.incentives?.incentive,
    coupons: promotion.coupons?.coupon,
  }));
}

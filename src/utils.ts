import {
  ChargeData,
  CreateCustomerRequest,
  ItemData,
  SubscriptionData,
} from "./types";

type MakeAuthHeaderProps = {
  username: string;
  password: string;
};
export function makeAuthHeader({
  username,
  password,
}: MakeAuthHeaderProps): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

export function parseCustomerRequest(request: CreateCustomerRequest) {
  const { subscription, charges, items, ...data } = request;
  return {
    ...data,
    ...(subscription && parseSubscriptionData(subscription)),
    ...(charges && parseChargesData(charges)),
    ...(items && parseItemsData(items)),
  };
}

export function parseSubscriptionData(subscription: SubscriptionData) {
  return Object.fromEntries(
    Object.entries(subscription).map(([key, value]) => [
      `subscription[${key}]`,
      value,
    ]),
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

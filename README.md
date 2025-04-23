## JavaScript Cheddar API wrapper

This module will simplify the process of integrating [Cheddar](https://www.getcheddar.com/) into your existing JavaScript apps.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents**

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Implemented methods](#implemented-methods)
- [Running tests](#running-tests)
- [Credits](#credits)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

```
npx jsr add @tive/cheddar
```

# Basic usage

```typescript
import { Cheddar } from "cheddar";

const cheddar = new Cheddar({
  username: "email@example.com",
  password: "passwordExample",
  productCode: "PRODUCT_CODE",
});

cheddar
  .getPlans()
  .then((plans) => console.log(plans))
  .catch((err) => console.error(err));

// When inside an async function, you can simply await any Cheddar function
const plans = await cheddar.getPlans();
```

# Implemented methods

- `getPlans()`
- `getPlan(planCode)`
- `getCustomers(getCustomersRequest)`
- `getCustomer(customerCode)`
- `createCustomer(createCustomerRequest)`
- `editCustomerAndSubscription(editCustomerSubscriptionRequest)`
- `editCustomer(editCustomerRequest)`
- `editSubscription(editSubscriptionRequest)`
- `deleteCustomer(customerCode)`
- `cancelSubscription(customerCode)`
- `addItem(itemQuantityRequest)`
- `removeItem(itemQuantityRequest)`
- `setItemQuantity(setItemQuantityRequest)`
- `addCustomCharge(addCustomChargeRequest)`
- `deleteCustomCharge(deleteCustomChargeRequest)`
- `createOneTimeInvoice(createOneTimeInvoiceRequest)`
- `runOutstandingInvoice(outstandingInvoiceRequest)`
- `issueRefund(issueRefundRequest)`
- `issueVoid(issueVoidRequest)`
- `issueVoidOrRefund(issueVoidRequest)`
- `resendInvoiceEmail(issueVoidRequest)`
- `getPromotions()`
- `getPromotion(promotionCode)`

All methods return a promise with the requested data in JSON format.

# Running tests

First add a config file (`config.json`) with all your Cheddar credentials:

```json
{
  "username": "EMAIL",
  "password": "PASSWORD",
  "productCode": "PRODUCTCODE",
  "planCode": "PLANCODE",
  "itemCode": "ITEMCODE",
  "promoCode": "PROMOCODE"
}
```

Now you can install all dependencies and run the tests:

```
npm install
npm test
```

> **WARNING:** Only run the tests on a development account to prevent any side effects in production

# Credits

Original work was done by [Kevin Smith](https://github.com/respectTheCode).
Ported to typescript by [Victor Uvarov](https://github.com/victortive).

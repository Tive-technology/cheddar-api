import {
  customersParser,
  parseAddCustomChargeData,
  parseCreateCustomerRequest,
  parseCreateOneTimeInvoiceData,
  parseEditCustomerData,
  parseGetCustomersRequest,
  parseIssueRefundRequest,
  parseIssueVoidRequest,
  parseItemQuantityData,
  parseSetItemQuantityData,
  parseSubscriptionData,
  plansParser,
  promotionsParser,
} from "./parser";
import {
  type AddCustomChargeRequest,
  type CheddarConfig,
  type CheddarError,
  type CreateCustomerRequest,
  type CreateOneTimeInvoiceRequest,
  type Customer,
  type CustomersXmlResult,
  type DeleteCustomChargeRequest,
  type EditCustomerRequest,
  type EditCustomerSubscriptionRequest,
  type EditSubscriptionRequest,
  type GetCustomersRequest,
  type IssueRefundRequest,
  type IssueVoidRequest,
  type ItemQuantityRequest,
  type OutstandingInvoiceRequest,
  type Plan,
  type PlansXmlResult,
  type Promotion,
  type PromotionsXmlResult,
  type SetItemQuantityRequest,
} from "./types";
import { makeAuthHeader } from "./utils";
import { handleXmlError, parseResult } from "./xmlParsing";

const BASE_URI = "https://getcheddar.com:443/xml";

/**
 * Cheddar API client wrapper
 *
 * ```typescript
 * const config: CheddarConfig = {...};
 * const cheddar = new Cheddar(config);
 * ```
 */
export class Cheddar {
  private authorizationHeader: string;
  private productCode: string;

  constructor(config: CheddarConfig) {
    const { username, password, productCode } = config;

    this.authorizationHeader = makeAuthHeader({ username, password });
    this.productCode = productCode;
  }

  private async callApi<T>({
    method,
    path,
    searchParams,
    data,
  }: {
    method: "GET" | "POST";
    path: string;
    searchParams?: URLSearchParams;
    data?: string[][] | Record<string, string> | string | URLSearchParams;
  }): Promise<{ result: T } | { error: CheddarError }> {
    // Encode the path, because some codes can contain spaces
    const encodedPath = encodeURI(path);
    const url = new URL(`${BASE_URI}/${encodedPath}`);

    if (searchParams) {
      url.search = searchParams.toString();
    }

    const requestConfig: RequestInit = {
      headers: {
        authorization: this.authorizationHeader,
        ...(data && { "Content-Type": "application/x-www-form-urlencoded" }),
      },
      body: data ? new URLSearchParams(data).toString() : undefined,
      method,
    };

    const response = await fetch(url, requestConfig);
    const text = await response.text();
    if (!response.ok) {
      return { error: handleXmlError(text) };
    }
    const result = await parseResult<T>(text);
    return { result };
  }

  /**
   * Get all pricing plans
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const plans = await cheddar.getPlans();
   * console.log(plans);
   * ```
   *
   * @returns A promise that resolves to an array of {@link Plan} objects
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#get-all-pricing-plans
   */
  async getPlans(): Promise<Plan[]> {
    const parseResult = await this.callApi<PlansXmlResult>({
      method: "GET",
      path: `plans/get/productCode/${this.productCode}`,
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return plansParser(parseResult.result);
  }

  /**
   * Get a Single Pricing Plan
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const plan = await cheddar.getPlan("PLAN_CODE");
   * if (plan) {
   *   console.log(plan);
   * } else {
   *   console.log("Plan not found.");
   * }
   * ```
   *
   * @param code - The unique code of the pricing plan to retrieve
   * @returns A promise that resolves to the {@link Plan} object, or `null` if the plan is not found
   * @throws A {@link CheddarError} if the API call fails with a non-404 status code
   *
   * @see https://docs.getcheddar.com/#get-a-single-pricing-plan
   */
  async getPlan(code: string): Promise<Plan | null> {
    const parseResult = await this.callApi<PlansXmlResult>({
      method: "GET",
      path: `plans/get/productCode/${this.productCode}/code/${code}`,
    });
    if ("error" in parseResult) {
      if (parseResult.error.code === 404) {
        return null;
      }
      throw parseResult.error;
    }
    return plansParser(parseResult.result)[0];
  }

  /**
   * Get All Customers
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const request: GetCustomersRequest = {
   *   search: "test@example.com",
   * };
   * const customers = await cheddar.getCustomers(request);
   * console.log(customers);
   * ```
   *
   * @param request - The search criteria, formatted as a {@link GetCustomersRequest}
   * @returns A promise that resolves to an array of {@link Customer} objects
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#get-all-customers
   */
  async getCustomers(request: GetCustomersRequest): Promise<Customer[]> {
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "GET",
      path: `customers/get/productCode/${this.productCode}`,
      searchParams: parseGetCustomersRequest(request),
    });
    if ("error" in parseResult) {
      if (parseResult.error.code === 404) {
        return [];
      }
      throw parseResult.error;
    }
    return customersParser(parseResult.result);
  }

  /**
   * Get a single customer
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.getCustomer("CUSTOMER_CODE");
   * if (customer) {
   *   console.log(customer);
   * } else {
   *   console.log("Customer not found.");
   * }
   * ```
   *
   * @param code - The unique code of the customer to retrieve
   * @returns A promise that resolves to the {@link Customer} object, or `null` if the customer is not found
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#get-a-single-customer
   */
  async getCustomer(code: string): Promise<Customer | null> {
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "GET",
      path: `customers/get/productCode/${this.productCode}/code/${code}`,
    });
    if ("error" in parseResult) {
      if (parseResult.error.code === 404) {
        return null;
      }
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Create a new customer in the product and subscribe the customer to a pricing plan.
   *
   * @example
   * ```typescript
   * const subscriptionData: SubscriptionData = {
   *   planCode: "PLAN_CODE",
   *   method: "cc",
   *   ccNumber: "4111111111111111",
   *   ccExpiration: "12/2030",
   *   ccType: "visa",
   *   ccCardCode: "123",
   *   ccFirstName: "FName",
   *   ccLastName: "LName",
   *   ccZip: "95123",
   * };
   *
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.createCustomer({
   *   code: "CUSTOMER_CODE",
   *   firstName: "FName",
   *   lastName: "LName",
   *   email: "test@example.com",
   *   subscription: subscriptionData,
   * });
   * ```
   *
   * @param request - The customer details and subscription data, formatted as a {@link CreateCustomerRequest}
   * @returns A promise that resolves to the newly created {@link Customer} object
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#create-a-new-customer
   */
  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/new/productCode/${this.productCode}`,
      data: parseCreateCustomerRequest(request),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Update a Customer and Subscription
   *
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#update-a-customer-and-subscription
   */
  async editCustomerAndSubscription(
    request: EditCustomerSubscriptionRequest
  ): Promise<Customer> {
    const { customerCode, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/edit/productCode/${this.productCode}/code/${customerCode}`,
      data,
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Update a Customer Only
   *
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.editCustomer({
   *   code: customerCode,
   *   firstName: "updatedFirstName",
   * });
   * ```
   *
   * @param request - The customer data to update
   * @returns The updated {@link Customer}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#update-a-customer-only
   */
  async editCustomer(request: EditCustomerRequest): Promise<Customer> {
    const { code, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/edit-customer/productCode/${this.productCode}/code/${code}`,
      data: parseEditCustomerData(data),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Update an existing customer's subscription information in the product.
   *
   * @example
   * ```typescript
   * const subscriptionData: SubscriptionData = {
   *   planCode: "PLAN_CODE",
   *   method: "cc",
   *   ccNumber: "4111111111111111",
   *   ccExpiration: "12/2030",
   *   ccType: "visa",
   *   ccCardCode: "123",
   *   ccFirstName: "FName",
   *   ccLastName: "LName",
   *   ccZip: "95123",
   * };
   *
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.editSubscription({
   *   customerCode: "CUSTOMER_CODE",
   *   ...subscriptionData,
   * });
   * ```
   *
   * @param request - The customer & subscription {@link EditSubscriptionRequest}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#update-a-subscription-only
   */
  async editSubscription(request: EditSubscriptionRequest): Promise<Customer> {
    const { customerCode, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/edit-subscription/productCode/${this.productCode}/code/${customerCode}`,
      data: parseSubscriptionData(data),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Delete an existing customer in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.deleteCustomer("CUSTOMER_CODE");
   * ```
   *
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#delete-a-customer
   */
  async deleteCustomer(code: string): Promise<any> {
    const parseResult = await this.callApi({
      method: "POST",
      path: `customers/delete/productCode/${this.productCode}/code/${code}`,
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return parseResult.result;
  }

  /**
   * Delete all existing customers in the product
   *
   * **Warning** - This will delete all customers and all related data in Cheddar.
   * This method is disabled in production accounts.
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const timestamp = Math.floor(Date.now() / 1000);
   * const result = await cheddar.deleteAllCustomers(timestamp);
   * ```
   *
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#delete-all-customers
   */
  async deleteAllCustomers(unixtimestamp: number): Promise<any> {
    const parseResult = await this.callApi({
      method: "POST",
      path: `customers/delete-all/confirm/${unixtimestamp}/productCode/${this.productCode}`,
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return parseResult.result;
  }

  /**
   * Cancel an existing customer's subscription in the product
   *
   * The customer's current subscription will be canceled at the moment this call is made.
   * If you would like to reactivate a customer's subscription, you may do so by updating
   * the subscription with full credit card data.
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.cancelSubscription("CUSTOMER_CODE");
   * ```
   *
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see http://docs.getcheddar.com/#cancel-a-customer-39-s-subscription
   */
  async cancelSubscription(code: string): Promise<Customer> {
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/cancel/productCode/${this.productCode}/code/${code}`,
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Increment a customer's current usage of a single item in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.addItem({
   *   customerCode: "CUSTOMER_CODE",
   *   itemCode: "ITEM_CODE",
   *   quantity: 3,
   * });
   * ```
   *
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#add-item-quantity
   */
  async addItem(request: ItemQuantityRequest): Promise<Customer> {
    const { customerCode, itemCode, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/add-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data: parseItemQuantityData(data),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Decrement a customer's current usage of a single item in the product
   *
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.removeItem({
   *   customerCode: "CUSTOMER_CODE",
   *   itemCode: "ITEM_CODE",
   *   quantity: 3,
   * });
   * ```
   *
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#remove-item-quantity
   */
  async removeItem(request: ItemQuantityRequest): Promise<Customer> {
    const { customerCode, itemCode, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/remove-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data: parseItemQuantityData(data),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Set a customer's current usage of a single item in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.setItem({
   *   customerCode: "CUSTOMER_CODE",
   *   itemCode: "ITEM_CODE",
   *   quantity: 3,
   * });
   * ```
   *
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#set-item-quantity
   */
  async setItem(request: SetItemQuantityRequest): Promise<Customer> {
    const { customerCode, itemCode, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/set-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data: parseSetItemQuantityData(data),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Add an arbitrary charge or credit to the customer's current invoice in the product.
   * This method requires the {@link AddCustomChargeRequest} containing the charge details.
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.addCustomCharge({
   *   customerCode: "CUSTOMER_CODE",
   *   chargeCode: "CUSTOM",
   *   quantity: 4,
   *   eachAmount: 2.25,
   * });
   * ```
   *
   * @param request - Charge details formatted as a {@link AddCustomChargeRequest}
   * @returns A promise that resolves to the updated {@link Customer}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#add-a-custom-charge-credit
   */
  async addCustomCharge(request: AddCustomChargeRequest): Promise<Customer> {
    const { customerCode, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/add-charge/productCode/${this.productCode}/code/${customerCode}`,
      data: parseAddCustomChargeData(data),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Remove a charge or credit from the customer's current invoice in the product.
   * This method expects a {@link DeleteCustomChargeRequest} for the request body.
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const customer = await cheddar.deleteCustomCharge({
   *   customerCode: "CUSTOMER_CODE",
   *   chargeId: "CUSTOM",
   * });
   * ```
   *
   * @param request - Charge information to be deleted, formatted as a {@link DeleteCustomChargeRequest}
   * @returns A promise that resolves to the updated {@link Customer}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#delete-a-custom-charge-credit
   */
  async deleteCustomCharge(
    request: DeleteCustomChargeRequest
  ): Promise<Customer> {
    const { customerCode, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/delete-charge/productCode/${this.productCode}/code/${customerCode}`,
      data,
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Create a One-Time Invoice
   *
   * Create a parallel one-time invoice and execute the transaction immediately
   * using the customer's current payment method in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const result = await cheddar.createOneTimeInvoice({
   *   customerCode: "CUSTOMER_CODE",
   *   charges: [
   *     {
   *       chargeCode: "CODE",
   *       quantity: 10,
   *       eachAmount: 2.25,
   *       description: "In game currency"
   *     },
   *   ],
   * });
   * ```
   *
   * @param request - invoice request {@link CreateOneTimeInvoiceRequest}
   *
   * @see https://docs.getcheddar.com/#invoice-interactions
   */
  async createOneTimeInvoice(
    request: CreateOneTimeInvoiceRequest
  ): Promise<any> {
    const { customerCode, ...data } = request;
    const parseResult = await this.callApi({
      method: "POST",
      path: `invoices/new/productCode/${this.productCode}/code/${customerCode}`,
      data: parseCreateOneTimeInvoiceData(data),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return parseResult.result;
  }

  /**
   * Execute an outstanding invoice in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const result = await cheddar.runOutstandingInvoice({
   *   customerCode: "CUSTOMER_CODE",
   *   ccCardCode: "123",
   * });
   * ```
   *
   * @param request - invoice request {@link OutstandingInvoiceRequest}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#run-an-outstanding-invoice
   */
  async runOutstandingInvoice(
    request: OutstandingInvoiceRequest
  ): Promise<Customer> {
    const { customerCode, ...data } = request;
    const parseResult = await this.callApi<CustomersXmlResult>({
      method: "POST",
      path: `customers/run-outstanding/productCode/${this.productCode}/code/${customerCode}`,
      data,
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return customersParser(parseResult.result)[0];
  }

  /**
   * Issue a Refund
   * Refund a transaction on a billed invoice in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const result = await cheddar.issueRefund({
   *   idOrNumber: "INVOICE_ID",
   *   amount: 75.35,
   * });
   * ```
   *
   * @param request - refund request {@link IssueRefundRequest}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#issue-a-refund
   */
  async issueRefund(request: IssueRefundRequest): Promise<any> {
    const parseResult = await this.callApi({
      method: "POST",
      path: `invoices/refund/productCode/${this.productCode}`,
      data: parseIssueRefundRequest(request),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return parseResult.result;
  }

  /**
   * Defer to Cheddar to decide if a void or a refund is executed against
   * the invoice in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const result = await cheddar.issueVoid({
   *   idOrNumber: "INVOICE_ID",
   * });
   * ```
   *
   * @param request - void request {@link IssueVoidRequest}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#issue-a-void
   */
  async issueVoid(request: IssueVoidRequest): Promise<any> {
    const parseResult = await this.callApi({
      method: "POST",
      path: `invoices/void/productCode/${this.productCode}`,
      data: parseIssueVoidRequest(request),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return parseResult.result;
  }

  /**
   * Defer to Cheddar to decide if a void or a refund is executed against the invoice in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const result = await cheddar.issueVoidOrRefund({
   *   idOrNumber: "INVOICE_ID",
   * });
   * ```
   *
   * @param request - void request {@link IssueVoidRequest}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#issue-a-void-or-refund
   */
  async issueVoidOrRefund(request: IssueVoidRequest): Promise<any> {
    const parseResult = await this.callApi({
      method: "POST",
      path: `invoices/void-or-refund/productCode/${this.productCode}`,
      data: parseIssueVoidRequest(request),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return parseResult.result;
  }

  /**
   * Send (or resend) email notification for the invoice in the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const result = await cheddar.resendInvoiceEmail({
   *   idOrNumber: "INVOICE_ID",
   * });
   * ```
   *
   * @param request - void request {@link IssueVoidRequest}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#send-or-resend-an-invoice-email
   */
  async resendInvoiceEmail(request: IssueVoidRequest): Promise<any> {
    const parseResult = await this.callApi({
      method: "POST",
      path: `invoices/send-email/productCode/${this.productCode}`,
      data: parseIssueVoidRequest(request),
    });
    if ("error" in parseResult) {
      throw parseResult.error;
    }
    return parseResult.result;
  }

  /**
   * Get all promotion data from the product
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const promotions = await cheddar.getPromotions();
   * console.log(promotions);
   * ```
   *
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#get-all-promotions
   */
  async getPromotions(): Promise<Promotion[]> {
    const parseResult = await this.callApi<PromotionsXmlResult>({
      method: "GET",
      path: `promotions/get/productCode/${this.productCode}`,
    });

    if ("error" in parseResult) {
      if (parseResult.error.code === 404) {
        return [];
      }
      throw parseResult.error;
    }
    return promotionsParser(parseResult.result);
  }

  /**
   * Get the promotion data from the product
   * for the promotion with coupon code=MY_COUPON_CODE
   *
   * @example
   * ```typescript
   * const cheddar = new Cheddar({...});
   * const promotion = await cheddar.getPromotion("COUPON_CODE")
   * if (promotion) {
   *   console.log("Promotion found");
   * } else {
   *   console.log("Promotion not found");
   * }
   * ```
   *
   * @param code - coupon code
   * @returns A promise that resolves to the promotion {@link Promotion}
   * @throws A {@link CheddarError} if the API call fails
   *
   * @see https://docs.getcheddar.com/#get-a-single-promotions
   */
  async getPromotion(code: string): Promise<Promotion | null> {
    const parseResult = await this.callApi<PromotionsXmlResult>({
      method: "GET",
      path: `promotions/get/productCode/${this.productCode}/code/${code}`,
    });

    if ("error" in parseResult) {
      if (parseResult.error.code === 404) {
        return null;
      }
      throw parseResult.error;
    }
    return promotionsParser(parseResult.result)[0];
  }
}

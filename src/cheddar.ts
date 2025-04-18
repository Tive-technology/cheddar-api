import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import * as qs from "node:querystring";
import { customersParser, plansParser } from "./parser";
import {
  AddCustomChargeRequest,
  CheddarConfig,
  CreateCustomerRequest,
  CreateOneTimeInvoiceRequest,
  Customer,
  CustomersXmlParseResult,
  DeleteCustomChargeRequest,
  EditCustomerRequest,
  EditCustomerSubscriptionRequest,
  EditSubscriptionRequest,
  GetCustomersRequest,
  IssueRefundRequest,
  IssueVoidRequest,
  ItemQuantityRequest,
  OutstandingInvoiceRequest,
  Plan,
  PlansXmlParseResult,
  SetItemQuantityRequest,
} from "./types";
import {
  makeAuthHeader,
  parseCreateCustomerRequest,
  parseSubscriptionData,
} from "./utils";
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
    params,
    data,
  }: {
    method: "GET" | "POST";
    path: string;
    params?: any;
    data?: Record<string, any>;
  }): Promise<T | null> {
    // Encode the path, because some codes can contain spaces
    const encodedPath = encodeURI(path);

    const requestConfig: AxiosRequestConfig = {
      url: `${BASE_URI}/${encodedPath}`,
      headers: {
        authorization: this.authorizationHeader,
        ...(data && { "Content-Type": "application/x-www-form-urlencoded" }),
      },
      data: data ? qs.stringify(data) : undefined,
      params,
      method,
    };

    try {
      const response: AxiosResponse<T> = await axios(requestConfig);
      return await parseResult<T>(response.data as string);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      handleXmlError(error);
    }
  }

  /**
   * Get all pricing plan data from the product
   *
   * https://docs.getcheddar.com/#get-all-pricing-plans
   */
  async getPlans(): Promise<Plan[]> {
    const response = await this.callApi<PlansXmlParseResult>({
      method: "GET",
      path: `plans/get/productCode/${this.productCode}`,
    });
    if (!response) return [];

    return plansParser(response);
  }

  /**
   * Get the pricing plan data from the product
   *
   * https://docs.getcheddar.com/#get-a-single-pricing-plan
   */
  async getPlan(code: string): Promise<Plan | null> {
    const response = await this.callApi<PlansXmlParseResult>({
      method: "GET",
      path: `plans/get/productCode/${this.productCode}/code/${code}`,
    });
    if (!response) return null;
    return plansParser(response)[0];
  }

  /**
   * Get all customer data from the product
   *
   * https://docs.getcheddar.com/#get-all-customers
   */
  async getCustomers(request: GetCustomersRequest): Promise<Customer[]> {
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "GET",
      path: `customers/get/productCode/${this.productCode}`,
      params: request,
    });
    if (!response) return [];
    return customersParser(response);
  }

  /**
   * Get a Single Customer
   */
  async getCustomer(code: string): Promise<Customer | null> {
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "GET",
      path: `customers/get/productCode/${this.productCode}/code/${code}`,
    });
    if (!response) return null;
    return customersParser(response)[0];
  }

  /**
   * Create a new customer in the product and subscribe the customer to a pricing plan.
   *
   * https://docs.getcheddar.com/#create-a-new-customer
   */
  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/new/productCode/${this.productCode}`,
      data: parseCreateCustomerRequest(request),
    });
    return customersParser(response)[0];
  }

  /**
   * Update a Customer and Subscription
   *
   * https://docs.getcheddar.com/#update-a-customer-and-subscription
   */
  async editCustomerAndSubscription(
    request: EditCustomerSubscriptionRequest
  ): Promise<any> {
    const { customerCode, ...data } = request;
    return this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/edit/productCode/${this.productCode}/code/${customerCode}`,
      data,
    });
  }

  /**
   * Update a Customer Only
   *
   * https://docs.getcheddar.com/#update-a-customer-only
   */
  async editCustomer(request: EditCustomerRequest): Promise<Customer> {
    const { code, ...data } = request;
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/edit-customer/productCode/${this.productCode}/code/${code}`,
      data,
    });
    return customersParser(response)[0];
  }

  /**
   * Update an existing customer's subscription information in the product
   *
   * https://docs.getcheddar.com/#update-a-subscription-only
   */
  async editSubscription(request: EditSubscriptionRequest): Promise<Customer> {
    const { customerCode, ...data } = request;
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/edit-subscription/productCode/${this.productCode}/code/${customerCode}`,
      data: parseSubscriptionData(data),
    });
    return customersParser(response)[0];
  }

  /**
   * Delete an existing customer in the product
   *
   * https://docs.getcheddar.com/#delete-a-customer
   */
  async deleteCustomer(code: string): Promise<void> {
    return this.callApi({
      method: "POST",
      path: `customers/delete/productCode/${this.productCode}/code/${code}`,
    });
  }

  /**
   * Delete all existing customers in the product
   *
   * **Warning** - This will delete all customers and all related data in Cheddar.
   * This method is disabled in production accounts.
   *
   * https://docs.getcheddar.com/#delete-all-customers
   */
  async deleteAllCustomers(unixtimestamp: number): Promise<any> {
    return this.callApi({
      method: "POST",
      path: `customers/delete-all/confirm/${unixtimestamp}/productCode/${this.productCode}`,
    });
  }

  /**
   * Cancel an existing customer's subscription in the product
   *
   * The customer's current subscription will be canceled at the moment this call is made.
   * If you would like to reactivate a customer's subscription, you may do so by updating
   * the subscription with full credit card data.
   *
   * http://docs.getcheddar.com/#cancel-a-customer-39-s-subscription
   */
  async cancelSubscription(code: string): Promise<Customer> {
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/cancel/productCode/${this.productCode}/code/${code}`,
    });
    return customersParser(response)[0];
  }

  /**
   * Increment a customer's current usage of a single item in the product
   *
   * https://docs.getcheddar.com/#add-item-quantity
   */
  async addItem(request: ItemQuantityRequest): Promise<Customer> {
    const { customerCode, itemCode, ...data } = request;
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/add-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data,
    });
    return customersParser(response)[0];
  }

  /**
   * Decrement a customer's current usage of a single item in the product
   *
   * https://docs.getcheddar.com/#remove-item-quantity
   */
  async removeItem(request: ItemQuantityRequest): Promise<Customer> {
    const { customerCode, itemCode, ...data } = request;
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/remove-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data,
    });
    return customersParser(response)[0];
  }

  /**
   * Set a customer's current usage of a single item in the product
   *
   * https://docs.getcheddar.com/#set-item-quantity
   */
  async setItem(request: SetItemQuantityRequest): Promise<Customer> {
    const { customerCode, itemCode, ...data } = request;
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/set-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data,
    });
    return customersParser(response)[0];
  }

  /**
   * Add an arbitrary charge or credit to the customer's current invoice in the product
   */
  async addCustomCharge(request: AddCustomChargeRequest): Promise<Customer> {
    const { customerCode, ...data } = request;
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/add-charge/productCode/${this.productCode}/code/${customerCode}`,
      data,
    });
    return customersParser(response)[0];
  }

  /**
   * Remove a charge or credit from the customer's current invoice in the product
   *
   * https://docs.getcheddar.com/#delete-a-custom-charge-credit
   */
  async deleteCustomCharge(
    request: DeleteCustomChargeRequest
  ): Promise<Customer> {
    const { customerCode, ...data } = request;
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/delete-charge/productCode/${this.productCode}/code/${customerCode}`,
      data: data,
    });
    return customersParser(response)[0];
  }

  /**
   * Create a One-Time Invoice
   *
   * Create a parallel one-time invoice and execute the transaction immediately
   * using the customer's current payment method in the product
   *
   * https://docs.getcheddar.com/#invoice-interactions
   */
  async createOneTimeInvoice(
    request: CreateOneTimeInvoiceRequest
  ): Promise<any> {
    const { customerCode, ...data } = request;
    return this.callApi({
      method: "POST",
      path: `invoices/new/productCode/${this.productCode}/code/${customerCode}`,
      data,
    });
  }

  /**
   * Execute an outstanding invoice in the product
   *
   * https://docs.getcheddar.com/#run-an-outstanding-invoice
   */
  async runOutstandingInvoice(
    request: OutstandingInvoiceRequest
  ): Promise<Customer> {
    const { customerCode, ...data } = request;
    const response = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/run-outstanding/productCode/${this.productCode}/code/${customerCode}`,
      data: data,
    });
    return customersParser(response)[0];
  }

  /**
   * Issue a Refund
   * Refund a transaction on a billed invoice in the product
   */
  async issueRefund(request: IssueRefundRequest): Promise<any> {
    const { idOrNumber } = request;
    const isString = isNaN(Number(idOrNumber));

    return this.callApi({
      method: "POST",
      path: `invoices/refund/productCode/${this.productCode}`,
      data: {
        ...request,
        ...(isString
          ? { id: String(idOrNumber) }
          : { number: Number(idOrNumber) }),
      },
    });
  }

  /**
   * Defer to Cheddar to decide if a void or a refund is executed against
   * the invoice in the product
   *
   * https://docs.getcheddar.com/#issue-a-void
   */
  async issueVoid(request: IssueVoidRequest): Promise<any> {
    const { idOrNumber } = request;
    const isString = isNaN(Number(idOrNumber));

    return this.callApi({
      method: "POST",
      path: `invoices/void/productCode/${this.productCode}`,
      data: {
        ...request,
        ...(isString
          ? { id: String(idOrNumber) }
          : { number: Number(idOrNumber) }),
      },
    });
  }

  /**
   * Defer to Cheddar to decide if a void or a refund is executed against the invoice in the product
   *
   * https://docs.getcheddar.com/#issue-a-void-or-refund
   */
  async issueVoidOrRefund(request: IssueVoidRequest): Promise<any> {
    const { idOrNumber } = request;
    const isString = isNaN(Number(idOrNumber));

    return this.callApi({
      method: "POST",
      path: `invoices/void-or-refund/productCode/${this.productCode}`,
      data: {
        ...request,
        ...(isString
          ? { id: String(idOrNumber) }
          : { number: Number(idOrNumber) }),
      },
    });
  }

  /**
   * Send (or resend) email notification for the invoice in the product
   *
   * https://docs.getcheddar.com/#send-or-resend-an-invoice-email
   */
  async resendInvoiceEmail(request: IssueVoidRequest): Promise<any> {
    const { idOrNumber } = request;
    const isString = isNaN(Number(idOrNumber));

    return this.callApi({
      method: "POST",
      path: `invoices/send-email/productCode/${this.productCode}`,
      data: {
        ...request,
        ...(isString
          ? { id: String(idOrNumber) }
          : { number: Number(idOrNumber) }),
      },
    });
  }

  /**
   * Get all promotion data from the product
   *
   * https://docs.getcheddar.com/#get-all-promotions
   */
  async getPromotions(): Promise<any> {
    return this.callApi({
      method: "GET",
      path: `promotions/get/productCode/${this.productCode}`,
    });
  }

  /**
   * Get the promotion data from the product with productCode=MY_PRODUCT_CODE
   * for the promotion with coupon code=MY_COUPON_CODE
   *
   * @param code - coupon code
   */
  async getPromotion(code: string): Promise<any> {
    return this.callApi({
      method: "GET",
      path: `promotions/get/productCode/${this.productCode}/code/${code}`,
    });
  }
}

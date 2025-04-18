import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import * as qs from "node:querystring";
import {
  AddCustomChargeRequest,
  CheddarConfig,
  CreateCustomerRequest,
  CreateOneTimeInvoiceRequest,
  CustomerResponse,
  CustomersXmlParseResult,
  DeleteCustomChargeRequest,
  EditCustomerRequest,
  EditSubscriptionRequest,
  GetCustomersRequest,
  ItemQuantityRequest,
  Plan,
  PlansXmlParseResult,
  SetItemQuantityRequest,
} from "./types";
import {
  makeAuthHeader,
  parseCustomerRequest,
  parseSubscriptionData,
} from "./utils";
import { parseResult } from "./xmlParsing";

const BASE_URI = "https://getcheddar.com:443/xml";

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
      throw error;
    }
  }

  /**
   * Get all pricing plan data from the product
   *
   * https://docs.getcheddar.com/#get-all-pricing-plans
   */
  async getPlans(): Promise<Plan[]> {
    const result = await this.callApi<PlansXmlParseResult>({
      method: "GET",
      path: `plans/get/productCode/${this.productCode}`,
    });
    return result?.plans.plan ?? [];
  }

  /**
   * Get the pricing plan data from the product
   *
   * https://docs.getcheddar.com/#get-a-single-pricing-plan
   */
  async getPlan(code: string): Promise<Plan | null> {
    const result = await this.callApi<PlansXmlParseResult>({
      method: "GET",
      path: `plans/get/productCode/${this.productCode}/code/${code}`,
    });
    if (!result) return null;
    return result?.plans.plan[0];
  }

  /**
   * Get all customer data from the product
   *
   * https://docs.getcheddar.com/#get-all-customers
   */
  async getCustomers(
    request: GetCustomersRequest
  ): Promise<CustomerResponse[]> {
    const result = await this.callApi<CustomersXmlParseResult>({
      method: "GET",
      path: `customers/get/productCode/${this.productCode}`,
      params: request,
    });
    return result?.customers.customer ?? [];
  }

  /**
   * Get a Single Customer
   */
  async getCustomer(code: string): Promise<CustomerResponse | null> {
    const result = await this.callApi<CustomersXmlParseResult>({
      method: "GET",
      path: `customers/get/productCode/${this.productCode}/code/${code}`,
    });
    if (!result) return null;
    return result.customers.customer[0];
  }

  /**
   * Create a new customer in the product and subscribe the customer to a pricing plan.
   *
   * https://docs.getcheddar.com/#create-a-new-customer
   */
  async createCustomer(
    request: CreateCustomerRequest
  ): Promise<CustomerResponse> {
    const result = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/new/productCode/${this.productCode}`,
      data: parseCustomerRequest(request),
    });
    return result?.customers.customer[0];
  }

  /**
   * Update a Customer and Subscription
   *
   * https://docs.getcheddar.com/#update-a-customer-and-subscription
   */
  async editCustomerAndSubscription(
    code: string,
    data: Record<string, any>
  ): Promise<any> {
    return this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/edit/productCode/${this.productCode}/code/${code}`,
      data,
    });
  }

  /**
   * Update a Customer Only
   *
   * https://docs.getcheddar.com/#update-a-customer-only
   */
  async editCustomer(request: EditCustomerRequest): Promise<CustomerResponse> {
    const { code, ...data } = request;
    const result = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/edit-customer/productCode/${this.productCode}/code/${code}`,
      data,
    });
    return result.customers.customer[0];
  }

  /**
   * Update an existing customer's subscription information in the product
   *
   * https://docs.getcheddar.com/#update-a-subscription-only
   */
  async editSubscription(
    request: EditSubscriptionRequest
  ): Promise<CustomerResponse> {
    const { customerCode, ...data } = request;
    const result = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/edit-subscription/productCode/${this.productCode}/code/${customerCode}`,
      data: parseSubscriptionData(data),
    });
    return result.customers.customer[0];
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
  async cancelSubscription(code: string): Promise<CustomerResponse> {
    const result = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/cancel/productCode/${this.productCode}/code/${code}`,
    });
    return result.customers.customer[0];
  }

  /**
   * Increment a customer's current usage of a single item in the product
   *
   * https://docs.getcheddar.com/#add-item-quantity
   */
  async addTrackedItemQuantity(
    request: ItemQuantityRequest
  ): Promise<CustomerResponse> {
    const { customerCode, itemCode, ...data } = request;
    const result = await this.callApi<CustomersXmlParseResult>({
      method: "POST",
      path: `customers/add-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data,
    });
    return result.customers.customer[0];
  }

  /**
   * Decrement a customer's current usage of a single item in the product
   *
   * https://docs.getcheddar.com/#remove-item-quantity
   */
  async removeTrackedItemQuantity(request: ItemQuantityRequest): Promise<void> {
    const { customerCode, itemCode, ...data } = request;
    return this.callApi({
      method: "POST",
      path: `customers/remove-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data,
    });
  }

  /**
   * Set a customer's current usage of a single item in the product
   *
   * https://docs.getcheddar.com/#set-item-quantity
   */
  async setItemQuantity(request: SetItemQuantityRequest): Promise<void> {
    const { customerCode, itemCode, ...data } = request;
    return this.callApi({
      method: "POST",
      path: `customers/set-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
      data,
    });
  }

  /**
   * Add an arbitrary charge or credit to the customer's current invoice in the product
   */
  async addCustomCharge(
    code: string,
    request: AddCustomChargeRequest
  ): Promise<any> {
    return this.callApi({
      method: "POST",
      path: `customers/add-charge/productCode/${this.productCode}/code/${code}`,
      data: request,
    });
  }

  /**
   * Remove a charge or credit from the customer's current invoice in the product
   *
   * https://docs.getcheddar.com/#delete-a-custom-charge-credit
   */
  async deleteCustomCharge(
    code: string,
    request: DeleteCustomChargeRequest
  ): Promise<any> {
    return this.callApi({
      method: "POST",
      path: `customers/add-charge/productCode/${this.productCode}/code/${code}`,
      data: request,
    });
  }

  /**
   * Send (or resend) email notification for the invoice in the product
   *
   * https://docs.getcheddar.com/#send-or-resend-an-invoice-email
   */
  async resendInvoiceEmail(idOrNumber: string | number): Promise<any> {
    const data: { id?: string; number?: number } = {};
    if (isNaN(Number(idOrNumber))) {
      data.id = String(idOrNumber);
    } else {
      data.number = Number(idOrNumber);
    }
    return this.callApi({
      method: "POST",
      path: `invoices/send-email/productCode/${this.productCode}`,
      data,
    });
  }

  /**
   * Create a One-Time Invoice
   *
   * Create a parallel one-time invoice and execute the transaction immediately
   * using the customer's current payment method in the product
   *
   * https://docs.getcheddar.com/#invoice-interactions
   */
  async oneTimeInvoice(request: CreateOneTimeInvoiceRequest): Promise<any> {
    const { customerCode, ...data } = request;
    return this.callApi({
      method: "POST",
      path: `invoices/new/productCode/${this.productCode}/code/${customerCode}`,
      data,
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

export type CheddarConfig = {
  username: string;
  password: string;
  productCode: string;
};

export type QueryParams = {
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | { start: string; end: string }
    | undefined;
  productCode?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: { start: string; end: string };
};

export type GetCustomersRequest = {
  subscriptionStatus?: "activeOnly" | "canceledOnly";
  /**
   * Your pricing plan code.
   * This is an array and may be provided multiple times to filter by multiple plans.
   */
  planCode?: string[];
  createdAfterDate?: Date;
  createdBeforeDate?: Date;
  canceledAfterDate?: Date;
  canceledBeforeDate?: Date;
  transactedAfterDate?: Date;
  transactedBeforeDate?: Date;
  /**
   * "name" (default), "company", "plan", "billingDatetime" or "createdDatetime"
   */
  orderBy?: "name" | "company" | "plan" | "billingDatetime" | "createdDatetime";
  /**
   * "asc" (default) or "desc"
   */
  orderByDirection?: "asc" | "desc";
  /**
   * search customer name, company, email address and last four digits of credit card.
   */
  searchText?: string;
};

export type CustomerData = {
  code: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  subscription?: SubscriptionData;
  [key: string]: any;
};

export type ItemQuantityRequest = {
  customerCode: string;
  itemCode: string;
  /**
   * The positive amount accurate to up to 4 decimal places (if other that 1.0000)
   * that you wish to add/remove to the current usage for this item.
   *
   * Quantity is only required if you wish to add/remove more than one to the current usage amount.
   */
  quantity?: number;
  /**
   * Client IPv4 address
   */
  remoteAddress?: string;
};

export type SetItemQuantityRequest = ItemQuantityRequest & {
  invoicePeriod?: InvoicePeriod;
};

export type SubscriptionData = {
  planCode: string;
  /**
   * Coupon code for the promotion you'd like to apply to the subscription
   */
  couponCode?: string;
  /**
   * Date or datetime in ISO 8601 format. (e.g., 2011-08-01 or 2011-08-01T15:30:00+00:00). Date on which you would like the customers first invoice to be billable. This option overrides the pricing plan default. Must either be today's date (run invoice immediately) or a future date.
   */
  initialBillDate?: string;
  /**
   * "cc" (default) or "paypal"
   */
  method?: "cc" | "paypal";
  /**
   * Conditional (See Notes) Numbers only -- a valid credit/debit card number
   */
  ccNumber?: string;
  /**
   * Conditional (See Notes) MM/YYYY - the expiration date for the credit card
   */
  ccExpiration?: string;
  /**
   * Conditional. If plan is free, not required. If your preference is to require the cardCode, required. Not required when method is paypal. 3-4 digits - The Card Verification Value (CCV).
   */
  ccCardCode?: string;
  /**
   * Conditional (See Notes) The gateway reference code for the payment method. Provide this in lieu of ccNumber when pre-tokenized payment methods are available.
   */
  gatewayToken?: string;
  /**
   * Conditional visa, mc, disc, amex, diners, jcb, unk. If you specify a subscription[gatewayToken], this is required.
   */
  ccType?: "visa" | "mc" | "disc" | "amex" | "diners" | "jcb" | "unk";
  /**
   * Conditional Numbers only -- last four digits of credit/debit card number. If you specify a subscription[gatewayToken], this is required.
   */
  ccLastFour?: string;
  /**
   * Conditional (See Notes) Limited to 40 characters
   */
  ccFirstName?: string;
  /**
   * Conditional (See Notes) Limited to 40 characters
   */
  ccLastName?: string;
  /**
   * Limited to 60 characters
   */
  ccCompany?: string;
  /**
   * Limited to 60 characters. Many payment processors require that the ISO 2 char codes are used.
   */
  ccCountry?: string;
  /**
   * Limited to 60 characters
   */
  ccAddress?: string;
  /**
   * Limited to 40 characters. 2 character state/province codes are suggested when country is US/Canada.
   */
  ccState?: string;
  /**
   * Limited to 20 characters
   */
  ccZip?: string;
  /**
   * Conditional. Required when method is PayPal. Must be a valid URL. Only used when method is paypal. This is the location where subscriber is returned from paypal after accepting a preapproval.
   */
  returnUrl?: string;
  /**
   * Conditional. Required when method is PayPal. Must be a valid URL. Only used when method is paypal. This is the location where subscriber is returned from paypal after declining a preapproval.
   */
  cancelUrl?: string;
};

export type ChargeData = {
  /**
   * Your code for this charge. Limited to 36 characters.
   */
  chargeCode?: string;
  /**
   * Positive integer quantity
   */
  quantity?: number;
  /**
   * Positive or negative integer or float with two digit decimal precision. A positive number will create a charge (debit). A negative number will create a credit.
   */
  eachAmount?: number;
  /**
   * Description for this charge/credit
   */
  description?: string;
};

export type ItemData = {
  /**
   * Your code for this tracked item. Limited to 36 characters.
   */
  itemCode?: string;
  /**
   * The positive amount accurate to up to 4 decimal places that you wish to set the current usage to for this item. Can be zero.
   */
  quantity?: number;
};

export type CreateCustomerRequest = {
  /**
   * Your code for this customer. Limited to 255 characters.
   */
  code: string;
  /**
   * Conditional. The gateway reference code. Limited to 255 characters.
   */
  gatewayToken?: string;
  /**
   * Limited to 40 characters
   */
  firstName: string;
  /**
   * Limited to 40 characters
   */
  lastName: string;
  /**
   * Valid email address
   */
  email: string;
  /**
   * Limited to 60 characters
   */
  company?: string;
  /**
   * The rate for this customer if different than the configured default (e.g, 0.123)
   */
  taxRate?: number;
  /**
   * 1 or 0
   */
  isTaxExempt?: 0 | 1;
  /**
   * Customer tax number if applicable. Limited to 32 characters.
   */
  taxNumber?: string;
  /**
   * Limited to 255 characters
   */
  notes?: string;
  /**
   * Date or datetime in ISO 8601 format.(e.g., 2011-08-01 or 2011-08-01T15:30:00+00:00). See the KB Article
   */
  firstContactDatetime?: Date;
  /**
   * A valid URL referer. Limited to 255 characters. See the KB Article
   */
  referer?: string;
  /**
   * The "term" or "keyword" phrase that lead a potential customer to your site. Google Adwords equivalent: "utm_term". See the KB Article
   */
  campaignTerm?: string;
  /**
   * The name of the marketing campaign. Google Adwords equivalent: "utm_campaign". See the KB Article
   */
  campaignName?: string;
  /**
   * The source of the lead. Google Adwords equivalent: "utm_source". See the KB Article
   */
  campaignSource?: string;
  /**
   * The medium used to find your site. Google Adwords equivalent: "utm_medium". See the KB Article
   */
  campaignMedium?: string;
  /**
   * The content you wish to track. Google Adwords equivalent: "utm_content". See the KB Article
   */
  campaignContent?: string;
  /**
   * See the KB Article about customer metadata
   */
  metaData?: Record<string, any>;
  /**
   * Your code for the subscribed pricing plan.
   */
  subscription?: SubscriptionData;
  charges?: ChargeData[];
  items?: ItemData[];
  /**
   * Client IPv4 address
   */
  remoteAddress?: string;
};

export type CustomerResponse = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  notes: string;
  gatewayToken: string;
  isTaxExempt: number;
  isVatExempt: number;
  taxNumber: string;
  vatNumber: string;
  taxRate: string;
  firstContactDatetime: string;
  referer: string;
  refererHost: string;
  campaignSource: string;
  campaignMedium: string;
  campaignTerm: string;
  campaignContent: string;
  campaignName: string;
  key: string;
  createdDatetime: string;
  modifiedDatetime: string;
  metaData: string;
  subscriptions: any; // You might want to define a more specific type for this
  _id: string;
  _code: string;
};

export type Plan = {
  code: string;
  name: string;
  description: string;
  amount: number;
  interval: string;
  intervalCount: number;
  setupFee: number;
  trialDays: number;
  [key: string]: any;
};

export type Promotion = {
  code: string;
  name: string;
  description: string;
  type: string;
  amount: number;
  percent: number;
  maxRedemptions: number;
  expiresAt: string | null;
  coupons: { code: string }[];
  [key: string]: any;
};

/**
 * https://docs.getcheddar.com/#current-vs-outstanding-invoice
 */
export type InvoicePeriod = "current" | "outstanding";

export type EditCustomerRequest = {
  code: string;
  /**
   * Limited to 20 characters.
   */
  firstName?: string;
  /**
   * Limited to 20 characters.
   */
  lastName?: string;
  /**
   * Valid email address.
   */
  email?: string;
  /**
   * Limited to 60 characters.
   */
  company?: string;
  /**
   * Limited to 255 characters.
   */
  notes?: string;
  /**
   * The rate for this customer if different than the configured default (e.g., 0.123).
   * @pattern ^[-]?\d+(\.\d{1,3})?$ // Assuming up to 3 decimal places for tax rate
   */
  taxRate?: number;
  /**
   * 1 or 0.
   */
  isTaxExempt?: 0 | 1;
  /**
   * Customer tax number if applicable. Limited to 32 characters.
   * @maxLength 32
   */
  taxNumber?: string;
  /**
   * Date or datetime in ISO 8601 format (e.g., 2011-08-01 or 2011-08-01T15:30:00+00:00).
   * @format date-time
   */
  firstContactDatetime?: string;
  /**
   * A valid URL referer. Limited to 255 characters.
   * @maxLength 255
   * @format url
   */
  referer?: string;
  /**
   * The "term" or "keyword" phrase that lead a potential customer to your site. Google Adwords equivalent: "utm_term". Limited to 255 characters.
   * @maxLength 255
   */
  campaignTerm?: string;
  /**
   * The name of the marketing campaign. Google Adwords equivalent: "utm_campaign". Limited to 255 characters.
   * @maxLength 255
   */
  campaignName?: string;
  /**
   * The source of the lead. Google Adwords equivalent: "utm_source". Limited to 255 characters.
   * @maxLength 255
   */
  campaignSource?: string;
  /**
   * The medium used to find your site. Google Adwords equivalent: "utm_medium". Limited to 255 characters.
   * @maxLength 255
   */
  campaignMedium?: string;
  /**
   * The content you wish to track. Google Adwords equivalent: "utm_content". Limited to 255 characters.
   * @maxLength 255
   */
  campaignContent?: string;
  /**
   * User-defined metadata.
   */
  metaData?: Record<string, any>;
  /**
   * Client IPv4 address.
   * @format ipv4
   */
  remoteAddress?: string;
};

/**
 * Create a parallel one-time invoice and execute the transaction immediately
 * using the customer's current payment method in the product
 *
 * https://docs.getcheddar.com/#invoice-interactions
 */
export type CreateOneTimeInvoiceRequest = {
  customerCode: string;
  /**
   * An array of charges to include in the one-time invoice. Each object in the array represents a single charge.
   */
  charges: {
    /**
     * Your code for this charge. Limited to 36 characters.
     * @maxLength 36
     */
    chargeCode: string;
    /**
     * Positive integer quantity.
     */
    quantity: number;
    /**
     * Positive or negative integer or float with two digit decimal precision.
     * A positive number will create a charge (debit). A negative number will create a credit.
     */
    eachAmount: number;
    /**
     * Description for this charge/credit.
     */
    description?: string;
  }[];
  /**
   * Client IPv4 address.
   */
  remoteAddress?: string;
};

/**
 * Add an arbitrary charge or credit to the customer's current invoice in the product
 *
 * https://docs.getcheddar.com/#add-a-custom-charge-credit
 */
export type AddCustomChargeRequest = {
  /**
   * Your code for this charge. Limited to 36 characters.
   */
  chargeCode: string;
  /**
   * Positive integer quantity.
   */
  quantity: number;
  /**
   * Positive or negative integer or float with two digit decimal precision.
   */
  eachAmount: number;
  /**
   * Description for this charge/credit.
   */
  description?: string;
  /**
   * The billing period - 'current' (the default) or 'outstanding'.
   */
  invoicePeriod?: InvoicePeriod;
  /**
   * Client IPv4 address.
   */
  remoteAddress?: string;
};

/**
 * Remove a charge or credit from the customer's current invoice in the product
 *
 * https://docs.getcheddar.com/#delete-a-custom-charge-credit
 */
export type DeleteCustomChargeRequest = {
  /**
   * Cheddar's ID for the charge/credit
   */
  chargeId: string;
  /**
   * The billing period - 'current' (the default) or 'outstanding'. See below.
   */
  invoicePeriod?: InvoicePeriod;
  /**
   * Not Required (see below) Client IPv4 address
   */
  remoteAddress?: string;
};

/**
 * The Cheddar API returns appropriate HTTP status codes for every request.
 * https://docs.getcheddar.com/#response-codes
 */
export type CheddarApiStatusCode =
  | "200" // OK
  | "400" // Bad Request
  | "404" // Not Found
  | "412" // Precondition Failed
  | "422" // Unprocessable Entity
  | "500" // Internal Server Error
  | "502"; // Bad Gateway

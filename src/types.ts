/**
 * Error representation of an error returned from Cheddar API
 *
 * @example
 * ```xml
 * <error id="73542" code="404" auxCode="">Customer not found</error>
 * ```
 *
 * @see https://support.getcheddar.com/kb/api-8/error-handling
 */
export class CheddarError extends Error {
  override name = "CheddarError";
  readonly id: string;
  /**
   * https://support.getcheddar.com/kb/api-8/error-handling#3-the-details
   */
  readonly code: number;
  /**
   * https://support.getcheddar.com/kb/api-8/error-handling#4-the-gory-details
   */
  readonly auxCode?: string;

  constructor(id: string, code: number, message: string, auxCode?: string) {
    super(message);
    Object.setPrototypeOf(this, CheddarError.prototype);
    this.id = id;
    this.code = code;
    this.auxCode = auxCode;
  }
}

export type CheddarConfig = {
  username: string;
  password: string;
  productCode: string;
};

/**
 * @see https://docs.getcheddar.com/#get-all-customers
 */
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
  search?: string;
};

export type PaymentMethod = "cc" | "paypal";

export type CCType = "visa" | "mc" | "disc" | "amex" | "diners" | "jcb" | "unk";

/**
 * All API requests should include the client IP address if possible.
 * If not provided, the IP of the machine making the request will be used.
 * This value is used for rate limiting, fraud protection, etc.
 *
 * To prevent the same fraudster from attempting to signup for your service
 * over and over and over again with different credit card numbers, you'll
 * need to provide the IP address with the request.
 */
interface RemoteAddress {
  /**
   * Client IPv4 address.
   * @format ipv4
   * @see https://docs.getcheddar.com/#fraud-protection-rate-limiting
   */
  remoteAddress?: string;
}

/**
 * User-defined metadata.
 *
 * @see https://support.getcheddar.com/kb/api-8/customer-meta-data
 */
interface MetaData {
  /**
   * We recognize the need for this meta data feature in a billing capacity.
   * Please be reasonable in your use of the feature.
   * If Cheddar staff determines that the feature is being abused,
   * you may be asked to scale back your use of the feature or your account
   * may be canceled per the subscription agreement.
   */
  metaData?: Record<string, any>;
}

/**
 * The item quantity of a specific tracked item to be set
 */
export interface ItemQuantityData extends RemoteAddress {
  /**
   * The positive amount accurate to up to 4 decimal places (if other that 1.0000)
   * that you wish to add/remove to the current usage for this item.
   *
   * Quantity is only required if you wish to add/remove more than one to the current usage amount.
   */
  quantity?: number;
}

export interface SetItemQuantityData extends ItemQuantityData {
  invoicePeriod?: InvoicePeriod;
}

export interface ItemQuantityRequest extends ItemQuantityData {
  customerCode: string;
  itemCode: string;
}

/**
 * Set the item quantity of a specific tracked item
 */
export interface SetItemQuantityRequest extends SetItemQuantityData {
  customerCode: string;
  itemCode: string;
}

/**
 * Data for creating or editing a customer subscription
 */
export type SubscriptionData = {
  planCode: string;
  /**
   * Coupon code for the promotion you'd like to apply to the subscription
   */
  couponCode?: string;
  /**
   * Date or datetime in ISO 8601 format. (e.g., 2011-08-01 or 2011-08-01T15:30:00+00:00). Date on which you would like the customers first invoice to be billable. This option overrides the pricing plan default. Must either be today's date (run invoice immediately) or a future date.
   */
  initialBillDate?: Date;
  /**
   * "cc" (default) or "paypal"
   */
  method?: PaymentMethod;
  /**
   * Conditional (See Notes) Numbers only -- a valid credit/debit card number
   */
  ccNumber?: string;
  /**
   * Conditional (See Notes) MM/YYYY - the expiration date for the credit card
   */
  ccExpiration?: string;
  /**
   * Conditional. If plan is free, not required. If your preference is to require the cardCode, required.
   * Not required when method is paypal. 3-4 digits - The Card Verification Value (CCV).
   */
  ccCardCode?: string;
  /**
   * Conditional (See Notes) The gateway reference code for the payment method.
   * Provide this in lieu of ccNumber when pre-tokenized payment methods are available.
   */
  gatewayToken?: string;
  /**
   * Conditional visa, mc, disc, amex, diners, jcb, unk.
   * If you specify a subscription[gatewayToken], this is required.
   */
  ccType?: CCType;
  /**
   * Conditional Numbers only -- last four digits of credit/debit card number.
   * If you specify a subscription[gatewayToken], this is required.
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
   * Positive or negative integer or float with two digit decimal precision.
   * A positive number will create a charge (debit).
   * A negative number will create a credit.
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
   * The positive amount accurate to up to 4 decimal places that
   * you wish to set the current usage to for this item. Can be zero.
   */
  quantity?: number;
};

export interface CreateCustomerRequest extends MetaData, RemoteAddress {
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
   * Date or datetime in ISO 8601 format.(e.g., 2011-08-01 or 2011-08-01T15:30:00+00:00).
   * See the KB Article
   */
  firstContactDatetime?: Date;
  /**
   * A valid URL referer. Limited to 255 characters. See the KB Article
   */
  referer?: string;
  /**
   * The "term" or "keyword" phrase that lead a potential customer to your site.
   * Google Adwords equivalent: "utm_term". See the KB Article
   */
  campaignTerm?: string;
  /**
   * The name of the marketing campaign.
   * Google Adwords equivalent: "utm_campaign". See the KB Article
   */
  campaignName?: string;
  /**
   * The source of the lead.
   * Google Adwords equivalent: "utm_source". See the KB Article
   */
  campaignSource?: string;
  /**
   * The medium used to find your site.
   * Google Adwords equivalent: "utm_medium". See the KB Article
   */
  campaignMedium?: string;
  /**
   * The content you wish to track.
   * Google Adwords equivalent: "utm_content". See the KB Article
   */
  campaignContent?: string;
  /**
   * Your code for the subscribed pricing plan.
   */
  subscription?: SubscriptionData;
  charges?: ChargeData[];
  items?: ItemData[];
}

export interface EditCustomerSubscriptionData extends MetaData, RemoteAddress {
  gatewayToken?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  notes?: string;
  taxRate?: number;
  isTaxExempt?: boolean;
  taxNumber?: string;
  firstContactDatetime?: Date;
  referer?: string;
  campaignTerm?: string;
  campaignName?: string;
  campaignSource?: string;
  campaignMedium?: string;
  campaignContent?: string;
  subscription?: SubscriptionData;
}

export interface EditCustomerSubscriptionRequest
  extends EditCustomerSubscriptionData {
  customerCode: string;
}

export type Charge = {
  _id: string;
  _code: string;
  type: string;
  quantity: number;
  eachAmount: number;
  description: string;
  createdDatetime?: string;
};

export type TransactionGatewayAccount = {
  id: string;
  gateway: string;
  type: string;
};

export type Transaction = {
  _id: string;
  _code: string;
  parentId?: string;
  gatewayToken?: string;
  gatewayAccount?: TransactionGatewayAccount;
  amount: number;
  memo: string;
  response: string;
  responseReason?: string;
  transactedDatetime: string;
  createdDatetime: string;
};

export type Invoice = {
  _id: string;
  number: string;
  type: string;
  vatRate?: string;
  billingDatetime: string;
  paidTransactionId?: string;
  createdDatetime: string;
  charges?: Charge[];
  transactions?: Transaction[];
};

export type SubscriptionItem = {
  _id: string;
  _code: string;
  name: string;
  quantity?: number;
  createdDatetime?: string;
  modifiedDatetime?: string;
};

export type PlanItem = {
  _id: string;
  _code: string;
  name: string;
  quantityIncluded: number;
  isPeriodic: string;
  overageAmount: string;
  createdDatetime: string;
};

/**
 * Cheddar's pricing plan
 *
 * @see https://support.getcheddar.com/kb/pricing-plans/pricing-plan-basics
 */
export type Plan = {
  _id: string;
  _code: string;
  name: string;
  description: string;
  isActive: string;
  isFree: string;
  trialDays: string;
  billingFrequency: string;
  billingFrequencyPer: string;
  billingFrequencyUnit: string;
  billingFrequencyQuantity: string;
  setupChargeCode: string;
  setupChargeAmount: string;
  recurringChargeCode: string;
  recurringChargeAmount: string;
  createdDatetime: string;
  items?: PlanItem[];
};

export type GatewayAccount = {
  id: string;
  gateway: string;
  type: string;
};

export type Subscription = {
  _id: string;
  plans?: Plan[];
  gatewayToken: string;
  gatewayAccount: GatewayAccount;
  ccFirstName: string;
  ccLastName: string;
  ccCompany?: string;
  ccCountry?: string;
  ccAddress?: string;
  ccCity?: string;
  ccState?: string;
  ccZip: string;
  ccType: string;
  ccLastFour: string;
  ccExpirationDate: string;
  canceledDatetime?: string;
  createdDatetime: string;
  items?: SubscriptionItem[];
  invoices?: Invoice[];
};

export interface Customer extends MetaData {
  _id: string;
  _code: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  notes?: string;
  gatewayToken: string;
  isVatExempt: string;
  vatNumber?: string;
  firstContactDatetime: string;
  referer?: string;
  refererHost?: string;
  campaignSource?: string;
  campaignMedium?: string;
  campaignTerm?: string;
  campaignContent?: string;
  campaignName?: string;
  createdDatetime: string;
  modifiedDatetime: string;
  subscriptions?: Subscription[];
}

/**
 * @see https://docs.getcheddar.com/#current-vs-outstanding-invoice
 */
export type InvoicePeriod = "current" | "outstanding";

/**
 * @see https://support.getcheddar.com/kb/pricing-plans/promotions
 */
export type Promotion = {
  _id: string;
  /**
   * Name - Less than 30 characters here.
   */
  name: string;
  /**
   * Less than 255 characters here.
   */
  description: string;
  createdDatetime: string;
  incentives?: Incentive[];
  coupons?: Coupon[];
};

export type Incentive = {
  _id: string;
  type: string;
  percentage: number;
  months: number;
};

export type Coupon = {
  _id: string;
  _code: string;
  code: string;
  maxRedemptions?: string;
  expirationDatetime: string;
  createdDatetime: string;
};

export interface EditCustomerRequest extends EditCustomerData {
  code: string;
}

export interface EditCustomerData extends MetaData, RemoteAddress {
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
   */
  taxRate?: number;
  /**
   * 1 or 0.
   */
  isTaxExempt?: boolean;
  /**
   * Customer tax number if applicable. Limited to 32 characters.
   * @maxLength 32
   */
  taxNumber?: string;
  /**
   * Date or datetime in ISO 8601 format (e.g., 2011-08-01 or 2011-08-01T15:30:00+00:00).
   * @format date-time
   */
  firstContactDatetime?: Date;
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
}

export interface EditSubscriptionRequest extends SubscriptionData {
  customerCode: string;
}

/**
 * Create a One-Time Invoice
 *
 * Create a parallel one-time invoice and execute the transaction immediately
 * using the customer's current payment method in the product
 */
export interface CreateOneTimeInvoiceRequest extends CreateOneTimeInvoiceData {
  customerCode: string;
}

/**
 * One time invoice charge for a specific customer with one or more charge items
 */
export interface CreateOneTimeInvoiceData extends RemoteAddress {
  /**
   * An array of charges to include in the one-time invoice. Each object in the array represents a single charge.
   */
  charges: {
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
     * A positive number will create a charge (debit). A negative number will create a credit.
     */
    eachAmount: number;
    /**
     * Description for this charge/credit.
     */
    description?: string;
  }[];
}

export interface AddCustomChargeRequest extends AddCustomChargeData {
  customerCode: string;
}

/**
 * Add a Custom Charge/Credit
 *
 * Add an arbitrary charge or credit to the customer's current invoice in the product
 */
export interface AddCustomChargeData extends RemoteAddress {
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
}

/**
 * Remove a charge or credit from the customer's current invoice in the product
 */
export interface DeleteCustomChargeRequest extends DeleteCustomChargeData {
  customerCode: string;
}

export interface DeleteCustomChargeData extends RemoteAddress {
  /**
   * Cheddar's ID for the charge/credit
   */
  chargeId: string;
  /**
   * The billing period - 'current' (the default) or 'outstanding'. See below.
   */
  invoicePeriod?: InvoicePeriod;
}

export interface OutstandingInvoiceRequest extends OutstandingInvoiceData {
  customerCode: string;
}

export interface OutstandingInvoiceData extends RemoteAddress {
  /**
   * 3-4 digits - The Card Verification Value (CCV).
   */
  ccCardCode?: string;
}

export interface IssueVoidRequest extends RemoteAddress {
  /**
   * Either Cheddar's ID for the invoice or the Cheddar-generated invoice number
   */
  idOrNumber: number | string;
}

export interface IssueRefundRequest extends IssueVoidRequest {
  /**
   * Required An amount less than or equal to the refundable amount. See notes.
   */
  amount: number;
}

export type ResendInvoiceEmailRequest = {
  /**
   * Either Cheddar's ID for the invoice or the Cheddar-generated invoice number
   */
  idOrNumber: number | string;
};

interface InvoiceXmlResult extends Omit<Invoice, "charges" | "transactions"> {
  charges?: { charge: Charge[] };
  transactions?: { transaction: Transaction[] };
}

interface PlanXmlResult extends Omit<Plan, "items"> {
  items?: { item: PlanItem[] };
}

interface SubscriptionXmlResult
  extends Omit<Subscription, "plans" | "items" | "invoices"> {
  plans?: { plan: PlanXmlResult[] };
  items?: { item: SubscriptionItem[] };
  invoices?: { invoice: InvoiceXmlResult[] };
}

interface CustomerXmlResult extends Omit<Customer, "subscriptions"> {
  subscriptions: { subscription: SubscriptionXmlResult[] };
}

interface PromotionXmlResult extends Omit<Promotion, "incentives" | "coupons"> {
  incentives: { incentive: Incentive[] };
  coupons: { coupon: Coupon[] };
}

export type CustomersXmlResult = {
  customers: { customer: CustomerXmlResult[] };
};

export type PlansXmlResult = { plans: { plan: PlanXmlResult[] } };

export type PromotionsXmlResult = {
  promotions: { promotion: PromotionXmlResult[] };
};

/**
 * Parse Cheddar error xml
 *
 * @example
 * ```xml
 * <?xml version="1.0" encoding="UTF-8"?>
 * <error id="73542" code="404" auxCode="">Customer not found</error>
 * ```
 */
export type ErrorXmlResult = {
  error: {
    _$text: string;
    _id: string;
    _code: number;
    _auxCode: string;
  };
};

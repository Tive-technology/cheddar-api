"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cheddar = void 0;
const axios_1 = __importDefault(require("axios"));
const qs = __importStar(require("node:querystring"));
const utils_1 = require("./utils");
const xmlParsing_1 = require("./xmlParsing");
const BASE_URI = "https://getcheddar.com:443/xml";
class Cheddar {
    constructor(config) {
        const { username, password, productCode } = config;
        this.authorizationHeader = (0, utils_1.makeAuthHeader)({ username, password });
        this.productCode = productCode;
    }
    async callApi({ method, path, params, data, }) {
        // Encode the path, because some codes can contain spaces
        const encodedPath = encodeURI(path);
        const requestConfig = {
            url: `${BASE_URI}/${encodedPath}`,
            headers: Object.assign({ authorization: this.authorizationHeader }, (data && { "Content-Type": "application/x-www-form-urlencoded" })),
            data: data ? qs.stringify(data) : undefined,
            params,
            method,
        };
        try {
            const response = await (0, axios_1.default)(requestConfig);
            return (0, xmlParsing_1.parseResult)(response.data);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    /**
     * Get all pricing plan data from the product
     *
     * https://docs.getcheddar.com/#get-all-pricing-plans
     */
    async getPlans() {
        const { plans } = await this.callApi({
            method: "GET",
            path: `/plans/get/productCode/${this.productCode}`,
        });
        return plans !== null && plans !== void 0 ? plans : [];
    }
    /**
     * Get the pricing plan data from the product
     *
     * https://docs.getcheddar.com/#get-a-single-pricing-plan
     */
    async getPlan(code) {
        const { plan } = await this.callApi({
            method: "GET",
            path: `/plans/get/productCode/${this.productCode}/code/${code}`,
        });
        return plan;
    }
    /**
     *
     * @param query
     * @returns
     */
    async getCustomers(request) {
        const { customers } = await this.callApi({
            method: "GET",
            path: `/customers/get/productCode/${this.productCode}`,
            params: request,
        });
        return customers;
    }
    async getCustomer(code) {
        const { customer } = await this.callApi({
            method: "GET",
            path: `/customers/get/productCode/${this.productCode}/code/${code}`,
        });
        return customer;
    }
    async createCustomer(request) {
        return this.callApi({
            method: "POST",
            path: `/customers/new/productCode/${this.productCode}`,
            data: request,
        });
    }
    async editCustomerAndSubscription(code, data) {
        return this.callApi({
            method: "POST",
            path: `/customers/edit/productCode/${this.productCode}/code/${code}`,
            data,
        });
    }
    async editCustomer(code, data) {
        return this.callApi({
            method: "POST",
            path: `/customers/edit-customer/productCode/${this.productCode}/code/${code}`,
            data,
        });
    }
    async editSubscription(code, data) {
        return this.callApi({
            method: "POST",
            path: `/customers/edit-subscription/productCode/${this.productCode}/code/${code}`,
            data,
        });
    }
    /**
     * Delete an existing customer in the product
     *
     * https://docs.getcheddar.com/#delete-a-customer
     */
    async deleteCustomer(code) {
        return this.callApi({
            method: "POST",
            path: `/customers/delete/productCode/${this.productCode}/code/${code}`,
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
    async deleteAllCustomers(unixtimestamp) {
        return this.callApi({
            method: "POST",
            path: `/customers/delete-all/confirm/${unixtimestamp}/productCode/${this.productCode}`,
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
    async cancelSubscription(code) {
        return this.callApi({
            method: "POST",
            path: `/customers/cancel/productCode/${this.productCode}/code/${code}`,
        });
    }
    /**
     * Increment a customer's current usage of a single item in the product
     *
     * https://docs.getcheddar.com/#add-item-quantity
     */
    async addTrackedItemQuantity(request) {
        const { customerCode, itemCode } = request, data = __rest(request, ["customerCode", "itemCode"]);
        return this.callApi({
            method: "POST",
            path: `/customers/add-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
            data,
        });
    }
    /**
     * Decrement a customer's current usage of a single item in the product
     *
     * https://docs.getcheddar.com/#remove-item-quantity
     */
    async removeTrackedItemQuantity(request) {
        const { customerCode, itemCode } = request, data = __rest(request, ["customerCode", "itemCode"]);
        return this.callApi({
            method: "POST",
            path: `/customers/remove-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
            data,
        });
    }
    /**
     * Set a customer's current usage of a single item in the product
     *
     * https://docs.getcheddar.com/#set-item-quantity
     */
    async setItemQuantity(request) {
        const { customerCode, itemCode } = request, data = __rest(request, ["customerCode", "itemCode"]);
        return this.callApi({
            method: "POST",
            path: `/customers/set-item-quantity/productCode/${this.productCode}/code/${customerCode}/itemCode/${itemCode}`,
            data,
        });
    }
    /**
     * Add an arbitrary charge or credit to the customer's current invoice in the product
     */
    async addCustomCharge(code, request) {
        return this.callApi({
            method: "POST",
            path: `/customers/add-charge/productCode/${this.productCode}/code/${code}`,
            data: request,
        });
    }
    /**
     * Remove a charge or credit from the customer's current invoice in the product
     *
     * https://docs.getcheddar.com/#delete-a-custom-charge-credit
     */
    async deleteCustomCharge(code, request) {
        return this.callApi({
            method: "POST",
            path: `/customers/add-charge/productCode/${this.productCode}/code/${code}`,
            data: request,
        });
    }
    async resendInvoiceEmail(idOrNumber) {
        const data = {};
        if (isNaN(Number(idOrNumber))) {
            data.id = String(idOrNumber);
        }
        else {
            data.number = Number(idOrNumber);
        }
        return this.callApi({
            method: "POST",
            path: `/invoices/send-email/productCode/${this.productCode}`,
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
    async oneTimeInvoice(code, request) {
        return this.callApi({
            method: "POST",
            path: `/invoices/new/productCode/${this.productCode}/code/${code}`,
            data: request,
        });
    }
    /**
     * Get all promotion data from the product
     *
     * https://docs.getcheddar.com/#get-all-promotions
     */
    async getPromotions(query) {
        const { promotions } = await this.callApi({
            method: "GET",
            path: `/promotions/get/productCode/${this.productCode}`,
        });
        return promotions || [];
    }
    /**
     * Get the promotion data from the product with productCode=MY_PRODUCT_CODE
     * for the promotion with coupon code=MY_COUPON_CODE
     *
     * @param code - coupon code
     */
    async getPromotion(code) {
        const { promotion } = await this.callApi({
            method: "GET",
            path: `/promotions/get/productCode/${this.productCode}/code/${code}`,
        });
        return promotion;
    }
}
exports.Cheddar = Cheddar;

const requestPromise = require('./requestPromise');
const { parseResult, handleXmlError } = require('./xmlParsing');

// To support async/await in node 4, we need the regeneratorRuntime
// We can remove this when we drop support for node 4
// eslint-disable-next-line no-unused-vars
const regeneratorRuntime = require('regenerator-runtime');

const BASE_URI = 'https://getcheddar.com:443';

function makeAuthHeader(username, password) {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

class Cheddar {
    constructor(config = {}, deprecatedPassword, deprecatedProductCode) {
        // backwards compatible initialisation via params
        if (typeof config === 'string') {
            // eslint-disable-next-line no-param-reassign
            config = {
                username: config,
                password: deprecatedPassword,
                productCode: deprecatedProductCode,
            };
        }

        const {
            username,
            password,
            productCode,
            productId,
        } = config;

        this.authorizationHeader = makeAuthHeader(username, password);
        this.productCode = productCode;
        this.productId = productId;
    }

    callApi(path, query = {}, data, {
        version = 'xml',
    } = {}) {
        // Encode the path, because some codes can contain spaces
        const encodedPath = encodeURI(path);

        const fullQuery = {
            productCode: this.productCode,
            productId: this.productId,
            ...query,
        };

        // Instead of passing startDate and endDate seperately, a dataRange can also be passed
        // Useful in combination with moment range libraries
        if (query.dateRange) {
            fullQuery.startDate = query.dateRange.start;
            fullQuery.endDate = query.dateRange.end;
        }

        const requestOptions = {
            uri: `${BASE_URI}/${version}${encodedPath}`,
            headers: {
                authorization: this.authorizationHeader,
            },
            form: data,
            proxy: process.env.CHEDDAR_PROXY_URL,
            qs: fullQuery,
            method: data ? 'POST' : 'GET',
            json: version === 'json',
        };

        const promise = requestPromise(requestOptions);

        switch (version) {
        case 'xml':
            return promise
                .then(parseResult)
                .catch(handleXmlError);
        default:
            return promise;
        }
    }

    callJsonApi(path, query = {}, data, options = {}) {
        return this.callApi(path, query, data, {
            ...options,
            version: 'json',
        });
    }

    async getPlans(query) {
        const { plans = [] } = await this.callApi('/plans/get', query);

        return plans;
    }

    async getPlan(code) {
        const plans = await this.getPlans({ code });

        return plans[0];
    }

    async getCustomers(query) {
        const { customers } = await this.callApi('/customers/get', query);

        return customers;
    }

    searchCustomers(query) {
        return this.callApi('/customers/search', query);
    }

    async getCustomer(code) {
        const customers = await this.getCustomers({ code });

        if (!customers || !customers.length) {
            throw new Error('No customers could be retrieved');
        }

        return customers[0];
    }

    createCustomer(data) {
        return this.callApi('/customers/new', {}, data);
    }

    editCustomerAndSubscription(code, data) {
        return this.callApi('/customers/edit', { code }, data);
    }

    editCustomer(code, data) {
        return this.callApi('/customers/edit-customer', { code }, data);
    }

    editSubscription(code, data) {
        return this.callApi('/customers/edit-subscription', { code }, data);
    }

    deleteCustomer(code) {
        return this.callApi('/customers/delete', { code });
    }

    deleteAllCustomers(unixtimestamp) {
        return this.callApi('/customers/delete-all', { confirm: unixtimestamp });
    }

    cancelSubscription(code) {
        return this.callApi('/customers/cancel', { code });
    }

    addItem(code, itemCode, quantity = 1) {
        return this.callApi('/customers/add-item-quantity', { code, itemCode }, { quantity });
    }

    removeItem(code, itemCode, quantity = 1) {
        return this.callApi('/customers/remove-item-quantity', { code, itemCode }, { quantity });
    }

    setItemQuantity(code, itemCode, quantity) {
        return this.callApi('/customers/set-item-quantity', { code, itemCode }, { quantity });
    }

    addCustomCharge(code, chargeCode, quantity, eachAmount, description) {
        return this.callApi('/customers/add-charge', { code }, {
            chargeCode,
            quantity,
            eachAmount,
            description,
        });
    }

    deleteCustomCharge(code, chargeId) {
        return this.callApi('/customers/delete-charge', { code }, { chargeId });
    }

    resendInvoiceEmail(idOrNumber) {
        let data;

        if (isNaN(idOrNumber)) {
            data = { id: idOrNumber };
        } else {
            data = { number: idOrNumber };
        }

        return this.callApi('/invoices/send-email', data);
    }

    oneTimeInvoice(code, data) {
        return this.callApi('/invoices/new', { code }, data);
    }

    async getPromotions(query) {
        const { promotions } = await this.callApi('/promotions/get', query);

        return promotions;
    }

    async getPromotion(code) {
        const promotions = await this.getPromotions({ code });

        return promotions && promotions[0];
    }
}

// Backwards compatible synonyms
Cheddar.prototype.updateCustomerAndSubscription = Cheddar.prototype.editCustomerAndSubscription;
Cheddar.prototype.updateCustomer = Cheddar.prototype.editCustomer;
Cheddar.prototype.updateSubscription = Cheddar.prototype.editSubscription;
Cheddar.prototype.getAllPricingPlans = Cheddar.prototype.getPlans;
Cheddar.prototype.getPricingPlan = Cheddar.prototype.getPlan;
Cheddar.prototype.getAllCustomers = Cheddar.prototype.getCustomers;

module.exports = Cheddar;

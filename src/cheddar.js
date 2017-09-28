const rp = require('request-promise-native');
const { parseResult, handleXmlError } = require('./xmlParsing');

const BASE_URI = 'https://getcheddar.com:443';

class Cheddar {
    constructor(user, pass, productCode) {
        if (typeof user === 'string') {
            this.auth = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
            this.productCode = productCode;
        } else {
            const {
                username,
                password,
                productCode: prCode,
                productId,
            } = user;

            this.auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
            this.productCode = prCode;
            this.productId = productId;
        }
    }

    callAPI(path, query = {}, data, {
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
                authorization: this.auth,
            },
            form: data,
            proxy: process.env.CHEDDAR_PROXY_URL,
            qs: fullQuery,
            method: data ? 'POST' : 'GET',
            json: version === 'json',
        };

        const promise = rp(requestOptions);

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
        return this.callAPI(path, query, data, {
            ...options,
            version: 'json',
        });
    }

    getPlans(query) {
        return this.callAPI('/plans/get', query)
            .then(({ plans = [] } = {}) => plans);
    }

    getPlan(code) {
        return this.getAllPricingPlans({ code })
            // Return the first plan (it should only contain 1)
            .then(plans => plans[0]);
    }

    getCustomers(query) {
        return this.callAPI('/customers/get', query)
            .then(({ customers } = {}) => customers);
    }

    searchCustomers(query) {
        return this.callAPI('/customers/search', query);
    }

    getCustomer(code) {
        return this.getCustomers({ code })
            .then((customers) => {
                if (!customers || !customers.length) {
                    throw new Error('No customers could be retrieved');
                }
                // Return the first customer (it should only contain 1)
                return customers[0];
            });
    }

    createCustomer(data) {
        return this.callAPI('/customers/new', {}, data);
    }

    editCustomerAndSubscription(code, data) {
        return this.callAPI('/customers/edit', { code }, data);
    }

    editCustomer(code, data) {
        return this.callAPI('/customers/edit-customer', { code }, data);
    }

    editSubscription(code, data) {
        return this.callAPI('/customers/edit-subscription', { code }, data);
    }

    deleteCustomer(code) {
        return this.callAPI('/customers/delete', { code });
    }

    deleteAllCustomers(unixtimestamp) {
        return this.callAPI('/customers/delete-all', { confirm: unixtimestamp });
    }

    cancelSubscription(code) {
        return this.callAPI('/customers/cancel', { code });
    }

    addItem(code, itemCode, quantity = 1) {
        return this.callAPI('/customers/add-item-quantity', { code, itemCode }, { quantity });
    }

    removeItem(code, itemCode, quantity = 1) {
        return this.callAPI('/customers/remove-item-quantity', { code, itemCode }, { quantity });
    }

    setItemQuantity(code, itemCode, quantity) {
        return this.callAPI('/customers/set-item-quantity', { code, itemCode }, { quantity });
    }

    addCustomCharge(code, chargeCode, quantity, eachAmount, description) {
        return this.callAPI('/customers/add-charge', { code }, {
            chargeCode,
            quantity,
            eachAmount,
            description,
        });
    }

    deleteCustomCharge(code, chargeId) {
        return this.callAPI('/customers/delete-charge', { code }, { chargeId });
    }

    resendInvoiceEmail(idOrNumber) {
        let data;

        if (isNaN(idOrNumber)) {
            data = { id: idOrNumber };
        } else {
            data = { number: idOrNumber };
        }

        return this.callAPI('/invoices/send-email', data);
    }

    oneTimeInvoice(code, data) {
        return this.callAPI('/invoices/new', { code }, data);
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

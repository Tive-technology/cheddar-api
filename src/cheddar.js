const xml2js = require('xml2js');
const rp = require('request-promise-native');

const baseUri = 'https://getcheddar.com:443';

const arrays = [
    'plans',
    'customers',
    'items',
    'charges',
    'invoices',
    'subscriptions',
    'transactions',
    'promotions',
];

function validator(xpath, currentValue, newValue) {
    // Empty values should be null
    if (!newValue) {
        return null;
    }

    // Parse integers
    if (!isNaN(newValue)) {
        return +newValue;
    }

    const paths = xpath.split('/');
    const item = paths[paths.length - 1];

    if (arrays.indexOf(item) === -1) {
        return newValue;
    }
    // Slice of the 's'
    const child = item.slice(0, item.length - 1);

    // Make sure the child is an array using the concat function
    return [].concat(newValue[child]);
}

const xmlParseOptions = {
    explicitRoot: true,
    explicitArray: false,
    validator,
    emptyTag: null,
    mergeAttrs: true,
};

function parseResult(data) {
    return new Promise(((resolve, reject) => {
        const parser = new xml2js.Parser(xmlParseOptions);

        parser.parseString(data, (err, xml) => {
            if (err) { // Handle error
                reject(err);
                return;
            } else if (!xml) { // Handle empty xml
                resolve(null);
                return;
            }

            const type = Object.keys(xml)[0];

            if (type === 'error') {
                const error = new Error(xml[type]._);
                error.code = +xml[type].code;
                reject(error);
            } else {
                resolve(xml[type]);
            }
        });
    }));
}

class Cheddar {
    constructor(user, pass, productCode) {
        if (typeof user === 'string') {
            this.auth = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
            this.productCode = productCode;
        } else {
            const options = user;

            this.auth = `Basic ${Buffer.from(`${options.username}:${options.password}`).toString('base64')}`;
            this.productCode = options.productCode;
            this.productId = options.productId;
        }
    }

    callAPI(path, data = {}) {
        // Encode the path, because some codes can contain spaces
        const encodedPath = encodeURI(path);

        const requestOptions = {
            uri: `${baseUri}/xml${encodedPath}`,
            headers: {
                authorization: this.auth,
            },
            form: data,
            proxy: process.env.CHEDDAR_PROXY_URL,
            qs: {
                productCode: this.productCode,
                productId: this.productId,
            },
        };

        const promise = rp.post(requestOptions)
            .then(parseResult)
            .catch((err) => {
                if (typeof err.error === 'string' && err.error.indexOf('<?xml') === 0) {
                    return parseResult(err.error).then((xml) => {
                        const error = new Error(xml.error._);
                        error.code = Number(xml.error.code);
                        throw error;
                    });
                }
                throw err;
            });

        return promise;
    }

    callReportingAPI(path, data = {}) {
        // Encode the path, because some codes can contain spaces
        const encodedPath = encodeURI(path);

        const requestOptions = {
            uri: `${baseUri}/json${encodedPath}`,
            headers: {
                authorization: this.auth,
            },
            qs: {
                productCode: this.productCode,
                productId: this.productId,
                startDate: data.dateRange && data.dateRange.start,
                endDate: data.dateRange && data.dateRange.end,
            },
            proxy: process.env.CHEDDAR_PROXY_URL,
            json: true,
        };

        return rp.get(requestOptions);
    }

    getAllPricingPlans() {
        return this.callAPI('/plans/get');
    }

    getPricingPlan(code) {
        return this.callAPI(`/plans/get/code/${code}`)
            .then(plans =>
                // Return the first plan (it should only contain 1)
                plans && plans[0]);
    }

    getAllCustomers(data) {
        return this.callAPI('/customers/get', data);
    }

    getCustomer(code) {
        return this.callAPI(`/customers/get/code/${code}`)
            .then((customers) => {
                if (!customers || !customers.length) {
                    throw new Error('No customers could be retrieved');
                }
                // Return the first customer (it should only contain 1)
                return customers[0];
            });
    }

    createCustomer(data) {
        return this.callAPI('/customers/new', data);
    }

    editCustomerAndSubscription(code, data) {
        return this.callAPI(`/customers/edit/code/${code}`, data);
    }

    editCustomer(code, data) {
        return this.callAPI(`/customers/edit-customer/code/${code}`, data);
    }

    editSubscription(code, data) {
        return this.callAPI(`/customers/edit-subscription/code/${code}`, data);
    }

    deleteCustomer(code) {
        return this.callAPI(`/customers/delete/code/${code}`);
    }

    deleteAllCustomers(unixtimestamp) {
        return this.callAPI(`/customers/delete-all/confirm/${unixtimestamp}`);
    }

    cancelSubscription(code) {
        return this.callAPI(`/customers/cancel/code/${code}`);
    }

    addItem(code, itemCode, amount) {
        let data;

        if (amount) {
            data = { quantity: amount.toString() };
        }

        return this.callAPI(`/customers/add-item-quantity/code/${code}/itemCode/${itemCode}`, data);
    }

    removeItem(code, itemCode, amount) {
        let data;

        if (amount) {
            data = { quantity: amount.toString() };
        }

        return this.callAPI(`/customers/remove-item-quantity/code/${code}/itemCode/${itemCode}`, data);
    }

    setItemQuantity(code, itemCode, amount) {
        const data = { quantity: amount.toString() };
        return this.callAPI(`/customers/set-item-quantity/code/${code}/itemCode/${itemCode}`, data);
    }

    addCustomCharge(code, chargeCode, quantity, amount, description) {
        const data = {
            chargeCode,
            quantity: quantity.toString(),
            eachAmount: amount.toString(),
            description,
        };

        return this.callAPI(`/customers/add-charge/code/${code}`, data);
    }

    deleteCustomCharge(code, chargeId) {
        const data = {
            chargeId,
        };
        return this.callAPI(`/customers/delete-charge/code/${code}`, data);
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

    oneTimeInvoice(customerCode, data) {
        return this.callAPI(`/invoices/new/code/${customerCode}`, data);
    }
}

Cheddar.prototype.updateCustomerAndSubscription = Cheddar.prototype.editCustomerAndSubscription;
Cheddar.prototype.updateCustomer = Cheddar.prototype.editCustomer;
Cheddar.prototype.updateSubscription = Cheddar.prototype.editSubscription;

module.exports = Cheddar;

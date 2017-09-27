'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var xml2js = require('xml2js');
var rp = require('request-promise-native');

var baseUri = 'https://getcheddar.com:443';

var Cheddar = function Cheddar(user, pass, productCode) {
    _classCallCheck(this, Cheddar);

    if (typeof user === 'string') {
        this.auth = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
        this.productCode = productCode;
    } else {
        var options = user;

        this.auth = 'Basic ' + Buffer.from(options.username + ':' + options.password).toString('base64');
        this.productCode = options.productCode;
        this.productId = options.productId;
    }
};

var arrays = ['plans', 'customers', 'items', 'charges', 'invoices', 'subscriptions', 'transactions', 'promotions'];

function validator(xpath, currentValue, newValue) {
    // Empty values should be null
    if (!newValue) {
        return null;
    }

    // Parse integers
    if (!isNaN(newValue)) {
        return +newValue;
    }

    var paths = xpath.split('/');
    var item = paths[paths.length - 1];

    if (arrays.indexOf(item) === -1) {
        return newValue;
    }
    // Slice of the 's'
    var child = item.slice(0, item.length - 1);

    // Make sure the child is an array using the concat function
    return [].concat(newValue[child]);
}

var xmlParseOptions = {
    explicitRoot: true,
    explicitArray: false,
    validator: validator,
    emptyTag: null,
    mergeAttrs: true
};

function parseResult(data) {
    return new Promise(function initPromise(resolve, reject) {
        var parser = new xml2js.Parser(xmlParseOptions);

        parser.parseString(data, function parse(err, xml) {
            if (err) {
                // Handle error
                reject(err);
                return;
            } else if (!xml) {
                // Handle empty xml
                resolve(null);
                return;
            }

            var type = Object.keys(xml)[0];

            if (type === 'error') {
                var error = new Error(xml[type]._);
                error.code = +xml[type].code;
                reject(error);
            } else {
                resolve(xml[type]);
            }
        });
    });
}

Cheddar.prototype.callAPI = function callAPI(path, data) {
    // Encode the path, because some codes can contain spaces
    var encodedPath = encodeURI(path);

    var requestOptions = {
        uri: baseUri + '/xml' + encodedPath,
        headers: {
            authorization: this.auth
        },
        form: data,
        proxy: process.env.CHEDDAR_PROXY_URL,
        qs: {
            productCode: this.productCode,
            productId: this.productId
        }
    };

    var promise = rp.post(requestOptions).then(parseResult).catch(function handleError(err) {
        if (typeof err.error === 'string' && err.error.indexOf('<?xml') === 0) {
            return parseResult(err.error).then(function createErrorFromXml(xml) {
                var error = new Error(xml.error._);
                error.code = Number(xml.error.code);
                throw error;
            });
        }
        throw err;
    });

    return promise;
};

Cheddar.prototype.callReportingAPI = function callReportingAPI(path, data) {
    // Encode the path, because some codes can contain spaces
    var encodedPath = encodeURI(path);

    var requestOptions = {
        uri: baseUri + '/json' + encodedPath,
        headers: {
            authorization: this.auth
        },
        qs: {
            productCode: this.productCode,
            productId: this.productId,
            startDate: data.dateRange && data.dateRange.start,
            endDate: data.dateRange && data.dateRange.end
        },
        proxy: process.env.CHEDDAR_PROXY_URL,
        json: true
    };

    return rp.get(requestOptions);
};

Cheddar.prototype.getAllPricingPlans = function getAllPricingPlans() {
    return this.callAPI('/plans/get');
};

Cheddar.prototype.getPricingPlan = function getPricingPlan(code) {
    var promise = this.callAPI('/plans/get/code/' + code).then(function getFirstPlan(plans) {
        // Return the first plan (it should only contain 1)
        return plans && plans[0];
    });

    return promise;
};

Cheddar.prototype.getAllCustomers = function getAllCustomers(data) {
    return this.callAPI('/customers/get', data);
};

Cheddar.prototype.getCustomer = function getCustomer(code) {
    var promise = this.callAPI('/customers/get/code/' + code).then(function getFirstCustomer(customers) {
        if (!customers || !customers.length) {
            throw new Error('No customers could be retrieved');
        }
        // Return the first customer (it should only contain 1)
        return customers[0];
    });

    return promise;
};

Cheddar.prototype.createCustomer = function createCustomer(data) {
    return this.callAPI('/customers/new', data);
};

Cheddar.prototype.editCustomerAndSubscription = function editCustomerAndSubscription(code, data) {
    return this.callAPI('/customers/edit/code/' + code, data);
};
Cheddar.prototype.updateCustomerAndSubscription = Cheddar.prototype.editCustomerAndSubscription;

Cheddar.prototype.editCustomer = function editCustomer(code, data) {
    return this.callAPI('/customers/edit-customer/code/' + code, data);
};
Cheddar.prototype.updateCustomer = Cheddar.prototype.editCustomer;

Cheddar.prototype.editSubscription = function editSubscription(code, data) {
    return this.callAPI('/customers/edit-subscription/code/' + code, data);
};
Cheddar.prototype.updateSubscription = Cheddar.prototype.editSubscription;

Cheddar.prototype.deleteCustomer = function deleteCustomer(code) {
    return this.callAPI('/customers/delete/code/' + code);
};

Cheddar.prototype.deleteAllCustomers = function deleteAllCustomers(unixtimestamp) {
    return this.callAPI('/customers/delete-all/confirm/' + unixtimestamp + '');
};

Cheddar.prototype.cancelSubscription = function cancelSubscription(code) {
    return this.callAPI('/customers/cancel/code/' + code);
};

Cheddar.prototype.addItem = function addItem(code, itemCode, amount) {
    var data;

    if (amount) {
        data = { quantity: amount.toString() };
    }

    return this.callAPI('/customers/add-item-quantity/code/' + code + '/itemCode/' + itemCode, data);
};

Cheddar.prototype.removeItem = function removeItem(code, itemCode, amount) {
    var data;

    if (amount) {
        data = { quantity: amount.toString() };
    }

    return this.callAPI('/customers/remove-item-quantity/code/' + code + '/itemCode/' + itemCode, data);
};

Cheddar.prototype.setItemQuantity = function setItemQuantity(code, itemCode, amount) {
    var data = { quantity: amount.toString() };
    return this.callAPI('/customers/set-item-quantity/code/' + code + '/itemCode/' + itemCode, data);
};

Cheddar.prototype.addCustomCharge = function addCustomCharge(code, chargeCode, quantity, amount, description) {
    var data = {
        chargeCode: chargeCode,
        quantity: quantity.toString(),
        eachAmount: amount.toString(),
        description: description
    };

    return this.callAPI('/customers/add-charge/code/' + code, data);
};

Cheddar.prototype.deleteCustomCharge = function deleteCustomCharge(code, chargeId) {
    var data = {
        chargeId: chargeId
    };
    return this.callAPI('/customers/delete-charge/code/' + code, data);
};

Cheddar.prototype.resendInvoiceEmail = function resendInvoiceEmail(idOrNumber) {
    var data;

    if (isNaN(idOrNumber)) {
        data = { id: idOrNumber };
    } else {
        data = { number: idOrNumber };
    }

    return this.callAPI('/invoices/send-email', data);
};

Cheddar.prototype.oneTimeInvoice = function oneTimeInvoice(customerCode, data) {
    return this.callAPI('/invoices/new/code/' + customerCode, data);
};

module.exports = Cheddar;
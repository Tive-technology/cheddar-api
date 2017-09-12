var xml2js = require('xml2js');
var rp = require('request-promise-native');

var Cheddar = function Cheddar(user, pass, productCode) {
    this.auth = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
    this.productCode = productCode;
};

var arrays = [
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

function getHost() {
    return process.env.CHEDDAR_HOST || process.env.CHEDDARGETTER_HOST || 'getcheddar.com';
}

function getPort() {
    return process.env.CHEDDAR_PORT || process.env.CHEDDARGETTER_PORT || 443;
}

var xmlParseOptions = {
    explicitRoot: true,
    explicitArray: false,
    validator: validator,
    emptyTag: null,
    mergeAttrs: true,
};

function parseResult(data) {
    return new Promise(function initPromise(resolve, reject) {
        var parser = new xml2js.Parser(xmlParseOptions);

        parser.parseString(data, function parse(err, xml) {
            if (err) { // Handle error
                reject(err);
                return;
            } else if (!xml) { // Handle empty xml
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
        uri: 'https://' + getHost() + ':' + getPort() + '/xml' + encodedPath,
        headers: {
            authorization: this.auth,
        },
        form: data,
    };

    var promise = rp.post(requestOptions)
        .then(parseResult)
        .catch(function handleError(err) {
            if (err.error && err.error.indexOf('<?xml') === 0) {
                return parseResult(err.error).then(function createErrorFromXml(xml) {
                    var error = new Error(xml.error._);
                    error.code = Number(xml.error.code);
                    throw error;
                });
            }
            return err;
        });

    return promise;
};

Cheddar.prototype.getAllPricingPlans = function getAllPricingPlans() {
    return this.callAPI('/plans/get/productCode/' + this.productCode);
};

Cheddar.prototype.getPricingPlan = function getPricingPlan(code) {
    var promise = this.callAPI('/plans/get/productCode/' + this.productCode + '/code/' + code)
        .then(function getFirstPlan(plans) {
            // Return the first plan (it should only contain 1)
            return plans && plans[0];
        });

    return promise;
};

Cheddar.prototype.getAllCustomers = function getAllCustomers(data) {
    return this.callAPI('/customers/get/productCode/' + this.productCode, data);
};

Cheddar.prototype.getCustomer = function getCustomer(code) {
    var promise = this.callAPI('/customers/get/productCode/' + this.productCode + '/code/' + code)
        .then(function getFirstCustomer(customers) {
            if (!customers || !customers.length) {
                throw new Error('No customers could be retrieved');
            }
            // Return the first customer (it should only contain 1)
            return customers[0];
        });

    return promise;
};

Cheddar.prototype.createCustomer = function createCustomer(data) {
    return this.callAPI('/customers/new/productCode/' + this.productCode, data);
};

Cheddar.prototype.editCustomerAndSubscription = function editCustomerAndSubscription(code, data) {
    return this.callAPI('/customers/edit/productCode/' + this.productCode + '/code/' + code, data);
};
Cheddar.prototype.updateCustomerAndSubscription = Cheddar.prototype.editCustomerAndSubscription;

Cheddar.prototype.editCustomer = function editCustomer(code, data) {
    return this.callAPI('/customers/edit-customer/productCode/' + this.productCode + '/code/' + code, data);
};
Cheddar.prototype.updateCustomer = Cheddar.prototype.editCustomer;

Cheddar.prototype.editSubscription = function editSubscription(code, data) {
    return this.callAPI('/customers/edit-subscription/productCode/' + this.productCode + '/code/' + code, data);
};
Cheddar.prototype.updateSubscription = Cheddar.prototype.editSubscription;

Cheddar.prototype.deleteCustomer = function deleteCustomer(code) {
    return this.callAPI('/customers/delete/productCode/' + this.productCode + '/code/' + code);
};

Cheddar.prototype.deleteAllCustomers = function deleteAllCustomers(unixtimestamp) {
    return this.callAPI('/customers/delete-all/confirm/' + unixtimestamp + '/productCode/' + this.productCode);
};

Cheddar.prototype.cancelSubscription = function cancelSubscription(code) {
    return this.callAPI('/customers/cancel/productCode/' + this.productCode + '/code/' + code);
};

Cheddar.prototype.addItem = function addItem(code, itemCode, amount) {
    var data;

    if (amount) {
        data = { quantity: amount.toString() };
    }

    return this.callAPI('/customers/add-item-quantity/productCode/' + this.productCode + '/code/' + code + '/itemCode/' + itemCode, data);
};

Cheddar.prototype.removeItem = function removeItem(code, itemCode, amount) {
    var data;

    if (amount) {
        data = { quantity: amount.toString() };
    }

    return this.callAPI('/customers/remove-item-quantity/productCode/' + this.productCode + '/code/' + code + '/itemCode/' + itemCode, data);
};

Cheddar.prototype.setItemQuantity = function setItemQuantity(code, itemCode, amount) {
    var data = { quantity: amount.toString() };
    return this.callAPI('/customers/set-item-quantity/productCode/' + this.productCode + '/code/' + code + '/itemCode/' + itemCode, data);
};

Cheddar.prototype.addCustomCharge =
function addCustomCharge(code, chargeCode, quantity, amount, description) {
    var data = {
        chargeCode: chargeCode,
        quantity: quantity.toString(),
        eachAmount: amount.toString(),
        description: description,
    };

    return this.callAPI('/customers/add-charge/productCode/' + this.productCode + '/code/' + code, data);
};

Cheddar.prototype.deleteCustomCharge = function deleteCustomCharge(code, chargeId) {
    var data = {
        chargeId: chargeId,
    };
    return this.callAPI('/customers/delete-charge/productCode/' + this.productCode + '/code/' + code, data);
};

Cheddar.prototype.resendInvoiceEmail = function resendInvoiceEmail(idOrNumber) {
    var data;

    if (isNaN(idOrNumber)) {
        data = { id: idOrNumber };
    } else {
        data = { number: idOrNumber };
    }

    return this.callAPI('/invoices/send-email/productCode/' + this.productCode, data);
};

Cheddar.prototype.oneTimeInvoice = function oneTimeInvoice(customerCode, data) {
    return this.callAPI('/invoices/new/productCode/' + this.productCode + '/code/' + customerCode, data);
};

module.exports = Cheddar;

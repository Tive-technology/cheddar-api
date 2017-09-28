'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var xml2js = require('xml2js');
var rp = require('request-promise-native');

var _require = require('xml2js/lib/processors'),
    parseNumbers = _require.parseNumbers;

var BASE_URI = 'https://getcheddar.com:443';

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

    // Slice of the 's', to get the object key
    // For instance: the key is customer, but the array item is customers
    var child = item.slice(0, item.length - 1);

    // Make sure the child is an array using the concat function
    var arrayChild = [].concat(newValue[child]);

    // If it's not the root array, return an array version directly
    if (!xpath.startsWith('/' + item)) {
        return arrayChild;
    }

    /* eslint-disable no-param-reassign */
    newValue[item] = arrayChild;
    delete newValue[child];
    /* eslint-enable no-param-reassign */

    return newValue;
}

var xmlParseOptions = {
    explicitRoot: true,
    explicitArray: false,
    validator: validator,
    emptyTag: null,
    mergeAttrs: true,
    valueProcessors: [parseNumbers],
    attrValueProcessors: [parseNumbers]
};

function parseResult(data) {
    return new Promise(function (resolve, reject) {
        var parser = new xml2js.Parser(xmlParseOptions);

        parser.parseString(data, function (err, xml) {
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

function handleXmlError(err) {
    if (typeof err.error === 'string' && err.error.indexOf('<?xml') === 0) {
        return parseResult(err.error).then(function (xml) {
            var error = new Error(xml.error._);
            error.code = Number(xml.error.code);
            throw error;
        });
    }
    throw err;
}

var Cheddar = function () {
    function Cheddar(user, pass, productCode) {
        _classCallCheck(this, Cheddar);

        if (typeof user === 'string') {
            this.auth = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
            this.productCode = productCode;
        } else {
            var username = user.username,
                password = user.password,
                prCode = user.productCode,
                productId = user.productId;


            this.auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
            this.productCode = prCode;
            this.productId = productId;
        }
    }

    _createClass(Cheddar, [{
        key: 'callAPI',
        value: function callAPI(path) {
            var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var data = arguments[2];

            var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
                _ref$version = _ref.version,
                version = _ref$version === undefined ? 'xml' : _ref$version;

            // Encode the path, because some codes can contain spaces
            var encodedPath = encodeURI(path);

            var fullQuery = _extends({
                productCode: this.productCode,
                productId: this.productId
            }, query);

            // Instead of passing startDate and endDate seperately, a dataRange can also be passed
            // Useful in combination with moment range libraries
            if (query.dateRange) {
                fullQuery.startDate = query.dateRange.start;
                fullQuery.endDate = query.dateRange.end;
            }

            var requestOptions = {
                uri: BASE_URI + '/' + version + encodedPath,
                headers: {
                    authorization: this.auth
                },
                form: data,
                proxy: process.env.CHEDDAR_PROXY_URL,
                qs: fullQuery,
                method: data ? 'POST' : 'GET',
                json: version === 'json'
            };

            var promise = rp(requestOptions);

            switch (version) {
                case 'xml':
                    return promise.then(parseResult).catch(handleXmlError);
                default:
                    return promise;
            }
        }
    }, {
        key: 'callJsonApi',
        value: function callJsonApi(path) {
            var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var data = arguments[2];
            var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            return this.callAPI(path, query, data, _extends({}, options, {
                version: 'json'
            }));
        }
    }, {
        key: 'getPlans',
        value: function getPlans(query) {
            return this.callAPI('/plans/get', query).then(function () {
                var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    _ref2$plans = _ref2.plans,
                    plans = _ref2$plans === undefined ? [] : _ref2$plans;

                return plans;
            });
        }
    }, {
        key: 'getPlan',
        value: function getPlan(code) {
            return this.getAllPricingPlans({ code: code })
            // Return the first plan (it should only contain 1)
            .then(function (plans) {
                return plans[0];
            });
        }
    }, {
        key: 'getCustomers',
        value: function getCustomers(query) {
            return this.callAPI('/customers/get', query).then(function () {
                var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    customers = _ref3.customers;

                return customers;
            });
        }
    }, {
        key: 'searchCustomers',
        value: function searchCustomers(query) {
            return this.callAPI('/customers/search', query);
        }
    }, {
        key: 'getCustomer',
        value: function getCustomer(code) {
            return this.getCustomers({ code: code }).then(function (customers) {
                if (!customers || !customers.length) {
                    throw new Error('No customers could be retrieved');
                }
                // Return the first customer (it should only contain 1)
                return customers[0];
            });
        }
    }, {
        key: 'createCustomer',
        value: function createCustomer(data) {
            return this.callAPI('/customers/new', {}, data);
        }
    }, {
        key: 'editCustomerAndSubscription',
        value: function editCustomerAndSubscription(code, data) {
            return this.callAPI('/customers/edit', { code: code }, data);
        }
    }, {
        key: 'editCustomer',
        value: function editCustomer(code, data) {
            return this.callAPI('/customers/edit-customer', { code: code }, data);
        }
    }, {
        key: 'editSubscription',
        value: function editSubscription(code, data) {
            return this.callAPI('/customers/edit-subscription', { code: code }, data);
        }
    }, {
        key: 'deleteCustomer',
        value: function deleteCustomer(code) {
            return this.callAPI('/customers/delete', { code: code });
        }
    }, {
        key: 'deleteAllCustomers',
        value: function deleteAllCustomers(unixtimestamp) {
            return this.callAPI('/customers/delete-all', { confirm: unixtimestamp });
        }
    }, {
        key: 'cancelSubscription',
        value: function cancelSubscription(code) {
            return this.callAPI('/customers/cancel', { code: code });
        }
    }, {
        key: 'addItem',
        value: function addItem(code, itemCode) {
            var quantity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            return this.callAPI('/customers/add-item-quantity', { code: code, itemCode: itemCode }, { quantity: quantity });
        }
    }, {
        key: 'removeItem',
        value: function removeItem(code, itemCode) {
            var quantity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            return this.callAPI('/customers/remove-item-quantity', { code: code, itemCode: itemCode }, { quantity: quantity });
        }
    }, {
        key: 'setItemQuantity',
        value: function setItemQuantity(code, itemCode, quantity) {
            return this.callAPI('/customers/set-item-quantity', { code: code, itemCode: itemCode }, { quantity: quantity });
        }
    }, {
        key: 'addCustomCharge',
        value: function addCustomCharge(code, chargeCode, quantity, eachAmount, description) {
            return this.callAPI('/customers/add-charge', { code: code }, {
                chargeCode: chargeCode,
                quantity: quantity,
                eachAmount: eachAmount,
                description: description
            });
        }
    }, {
        key: 'deleteCustomCharge',
        value: function deleteCustomCharge(code, chargeId) {
            return this.callAPI('/customers/delete-charge', { code: code }, { chargeId: chargeId });
        }
    }, {
        key: 'resendInvoiceEmail',
        value: function resendInvoiceEmail(idOrNumber) {
            var data = void 0;

            if (isNaN(idOrNumber)) {
                data = { id: idOrNumber };
            } else {
                data = { number: idOrNumber };
            }

            return this.callAPI('/invoices/send-email', data);
        }
    }, {
        key: 'oneTimeInvoice',
        value: function oneTimeInvoice(code, data) {
            return this.callAPI('/invoices/new', { code: code }, data);
        }
    }]);

    return Cheddar;
}();

// Backwards compatible synonyms


Cheddar.prototype.updateCustomerAndSubscription = Cheddar.prototype.editCustomerAndSubscription;
Cheddar.prototype.updateCustomer = Cheddar.prototype.editCustomer;
Cheddar.prototype.updateSubscription = Cheddar.prototype.editSubscription;
Cheddar.prototype.getAllPricingPlans = Cheddar.prototype.getPlans;
Cheddar.prototype.getPricingPlan = Cheddar.prototype.getPlan;
Cheddar.prototype.getAllCustomers = Cheddar.prototype.getCustomers;

module.exports = Cheddar;
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rp = require('request-promise-native');

var _require = require('./xmlParsing'),
    parseResult = _require.parseResult,
    handleXmlError = _require.handleXmlError;

// To support async/await in node 4, we need the regeneratorRuntime
// We can remove this when we drop support for node 4
// eslint-disable-next-line no-unused-vars


var regeneratorRuntime = require('regenerator-runtime');

var BASE_URI = 'https://getcheddar.com:443';

function makeAuthHeader(username, password) {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

var Cheddar = function () {
    function Cheddar() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var deprecatedPassword = arguments[1];
        var deprecatedProductCode = arguments[2];

        _classCallCheck(this, Cheddar);

        // backwards compatible initialisation via params
        if (typeof config === 'string') {
            // eslint-disable-next-line no-param-reassign
            config = {
                username: config,
                password: deprecatedPassword,
                productCode: deprecatedProductCode
            };
        }

        var _config = config,
            username = _config.username,
            password = _config.password,
            productCode = _config.productCode,
            productId = _config.productId;


        this.authorizationHeader = makeAuthHeader(username, password);
        this.productCode = productCode;
        this.productId = productId;
    }

    _createClass(Cheddar, [{
        key: 'callApi',
        value: function callApi(path) {
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
                uri: `${BASE_URI}/${version}${encodedPath}`,
                headers: {
                    authorization: this.authorizationHeader
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

            return this.callApi(path, query, data, _extends({}, options, {
                version: 'json'
            }));
        }
    }, {
        key: 'getPlans',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(query) {
                var _ref3, _ref3$plans, plans;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this.callApi('/plans/get', query);

                            case 2:
                                _ref3 = _context.sent;
                                _ref3$plans = _ref3.plans;
                                plans = _ref3$plans === undefined ? [] : _ref3$plans;
                                return _context.abrupt('return', plans);

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getPlans(_x6) {
                return _ref2.apply(this, arguments);
            }

            return getPlans;
        }()
    }, {
        key: 'getPlan',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(code) {
                var plans;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.getPlans({ code });

                            case 2:
                                plans = _context2.sent;
                                return _context2.abrupt('return', plans[0]);

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function getPlan(_x7) {
                return _ref4.apply(this, arguments);
            }

            return getPlan;
        }()
    }, {
        key: 'getCustomers',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(query) {
                var _ref6, customers;

                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.callApi('/customers/get', query);

                            case 2:
                                _ref6 = _context3.sent;
                                customers = _ref6.customers;
                                return _context3.abrupt('return', customers);

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function getCustomers(_x8) {
                return _ref5.apply(this, arguments);
            }

            return getCustomers;
        }()
    }, {
        key: 'searchCustomers',
        value: function searchCustomers(query) {
            return this.callApi('/customers/search', query);
        }
    }, {
        key: 'getCustomer',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(code) {
                var customers;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.getCustomers({ code });

                            case 2:
                                customers = _context4.sent;

                                if (!(!customers || !customers.length)) {
                                    _context4.next = 5;
                                    break;
                                }

                                throw new Error('No customers could be retrieved');

                            case 5:
                                return _context4.abrupt('return', customers[0]);

                            case 6:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function getCustomer(_x9) {
                return _ref7.apply(this, arguments);
            }

            return getCustomer;
        }()
    }, {
        key: 'createCustomer',
        value: function createCustomer(data) {
            return this.callApi('/customers/new', {}, data);
        }
    }, {
        key: 'editCustomerAndSubscription',
        value: function editCustomerAndSubscription(code, data) {
            return this.callApi('/customers/edit', { code }, data);
        }
    }, {
        key: 'editCustomer',
        value: function editCustomer(code, data) {
            return this.callApi('/customers/edit-customer', { code }, data);
        }
    }, {
        key: 'editSubscription',
        value: function editSubscription(code, data) {
            return this.callApi('/customers/edit-subscription', { code }, data);
        }
    }, {
        key: 'deleteCustomer',
        value: function deleteCustomer(code) {
            return this.callApi('/customers/delete', { code });
        }
    }, {
        key: 'deleteAllCustomers',
        value: function deleteAllCustomers(unixtimestamp) {
            return this.callApi('/customers/delete-all', { confirm: unixtimestamp });
        }
    }, {
        key: 'cancelSubscription',
        value: function cancelSubscription(code) {
            return this.callApi('/customers/cancel', { code });
        }
    }, {
        key: 'addItem',
        value: function addItem(code, itemCode) {
            var quantity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            return this.callApi('/customers/add-item-quantity', { code, itemCode }, { quantity });
        }
    }, {
        key: 'removeItem',
        value: function removeItem(code, itemCode) {
            var quantity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            return this.callApi('/customers/remove-item-quantity', { code, itemCode }, { quantity });
        }
    }, {
        key: 'setItemQuantity',
        value: function setItemQuantity(code, itemCode, quantity) {
            return this.callApi('/customers/set-item-quantity', { code, itemCode }, { quantity });
        }
    }, {
        key: 'addCustomCharge',
        value: function addCustomCharge(code, chargeCode, quantity, eachAmount, description) {
            return this.callApi('/customers/add-charge', { code }, {
                chargeCode,
                quantity,
                eachAmount,
                description
            });
        }
    }, {
        key: 'deleteCustomCharge',
        value: function deleteCustomCharge(code, chargeId) {
            return this.callApi('/customers/delete-charge', { code }, { chargeId });
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

            return this.callApi('/invoices/send-email', data);
        }
    }, {
        key: 'oneTimeInvoice',
        value: function oneTimeInvoice(code, data) {
            return this.callApi('/invoices/new', { code }, data);
        }
    }, {
        key: 'getPromotions',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(query) {
                var _ref9, promotions;

                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.callApi('/promotions/get', query);

                            case 2:
                                _ref9 = _context5.sent;
                                promotions = _ref9.promotions;
                                return _context5.abrupt('return', promotions);

                            case 5:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getPromotions(_x12) {
                return _ref8.apply(this, arguments);
            }

            return getPromotions;
        }()
    }, {
        key: 'getPromotion',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(code) {
                var promotions;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.getPromotions({ code });

                            case 2:
                                promotions = _context6.sent;
                                return _context6.abrupt('return', promotions && promotions[0]);

                            case 4:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function getPromotion(_x13) {
                return _ref10.apply(this, arguments);
            }

            return getPromotion;
        }()
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
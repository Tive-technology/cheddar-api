'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var xml2js = require('xml2js');

var _require = require('xml2js/lib/processors'),
    parseNumbers = _require.parseNumbers;

var arrays = ['plans', 'customers', 'items', 'charges', 'invoices', 'subscriptions', 'transactions', 'promotions', 'coupons', 'incentives'];

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

    if (item === 'coupon' && Array.isArray(newValue.code)) {
        var _newValue$code = _slicedToArray(newValue.code, 1),
            firstCode = _newValue$code[0];
        // eslint-disable-next-line no-param-reassign


        newValue.code = firstCode;
    }

    if (arrays.indexOf(item) === -1) {
        return newValue;
    }

    // Slice of the 's', to get the object key
    // For instance: the key is customer, but the array item is customers
    var child = item.slice(0, item.length - 1);

    // Make sure the child is an array using the concat function
    var arrayChild = [].concat(newValue[child]);

    // If it's not the root array, return an array version directly
    if (!xpath.startsWith(`/${item}`)) {
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
    validator,
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

module.exports.parseResult = parseResult;
module.exports.handleXmlError = handleXmlError;
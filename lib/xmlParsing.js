'use strict';

var xml2js = require('xml2js');

var _require = require('xml2js/lib/processors'),
    parseNumbers = _require.parseNumbers;

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

module.exports.parseResult = parseResult;
module.exports.handleXmlError = handleXmlError;
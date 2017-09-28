const xml2js = require('xml2js');
const { parseNumbers } = require('xml2js/lib/processors');

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

    // Slice of the 's', to get the object key
    // For instance: the key is customer, but the array item is customers
    const child = item.slice(0, item.length - 1);

    // Make sure the child is an array using the concat function
    const arrayChild = [].concat(newValue[child]);

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

const xmlParseOptions = {
    explicitRoot: true,
    explicitArray: false,
    validator,
    emptyTag: null,
    mergeAttrs: true,
    valueProcessors: [parseNumbers],
    attrValueProcessors: [parseNumbers],
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

function handleXmlError(err) {
    if (typeof err.error === 'string' && err.error.indexOf('<?xml') === 0) {
        return parseResult(err.error).then((xml) => {
            const error = new Error(xml.error._);
            error.code = Number(xml.error.code);
            throw error;
        });
    }
    throw err;
}

module.exports.parseResult = parseResult;
module.exports.handleXmlError = handleXmlError;

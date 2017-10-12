const request = require('request');

const CHEDDAR_RESPONSE_STATUS_CODE_ERROR = 'CHEDDAR_RESPONSE_STATUS_CODE_ERROR';

function requestPromise(options) {
    return new Promise((resolve, reject) => {
        function callback(err, response, body) {
            if (err) {
                reject(err);
                return;
            }

            const is2xx = /^2/.test(`${response.statusCode}`);

            if (is2xx) {
                resolve(body);
                return;
            }

            const error = new Error(CHEDDAR_RESPONSE_STATUS_CODE_ERROR);
            error.error = body;
            error.code = response.statusCode;
            reject(error);
        }
        request(options, callback);
    });
}

module.exports = requestPromise;

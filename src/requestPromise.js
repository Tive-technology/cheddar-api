const request = require('request');

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

            const error = new Error('');
            error.error = body;
            error.code = response.statusCode;
            reject(error);
        }
        request(options, callback);
    });
}

module.exports = requestPromise;

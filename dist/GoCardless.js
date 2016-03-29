'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = require('bluebird');
var request = require('request');

var pRequest = function pRequest(options) {
    return new Promise(function (resolve, reject) {
        request(options, function (err, response, body) {
            if (err) reject(err);
            resolve({ response: response, body: body });
        });
    });
};

function buildOptions(token, endPoint, path, method) {
    var body = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

    return {
        uri: endPoint + path,
        headers: {
            Authorization: "Bearer " + token,
            "GoCardless-Version": "2015-07-06",
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: body,
        json: true,
        method: method
    };
}

function goCardlessRedirectRequest(options) {
    return pRequest(options).then(function (response) {
        if (!response.body.redirect_flows) throw response.body;else return response.body;
    });
}

function goCardlessRequest(options) {
    return pRequest(options).then(function (response) {
        return response;
    });
}

function yyyymmdd(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]); // padding
}

var GoCardless = (function () {
    function GoCardless(config) {
        _classCallCheck(this, GoCardless);

        this.endPoint = config.sandbox ? 'https://api-sandbox.gocardless.com' : 'https://api.gocardless.com';
        if (!config.token) throw new Error('missing config.token');
        this.token = config.token;
    }

    /**
     * Generic GC API request
     * @param  {string} method "POST", "GET", "PUT", "DELETE"
     * @param  {string} path
     * @param  {mixed} body
     * @return {Promise<response>}
     */

    _createClass(GoCardless, [{
        key: 'request',
        value: function request(method, path) {
            var body = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            var options = buildOptions(this.token, this.endPoint, path, method, body);
            return goCardlessRequest(options);
        }
    }, {
        key: 'startRedirectFlow',
        value: function startRedirectFlow(description, sessionId, succesRedirectUrl) {
            var body = {
                "redirect_flows": {
                    "description": description,
                    "session_token": sessionId,
                    "success_redirect_url": succesRedirectUrl
                }
            };
            var path = '/redirect_flows';
            var options = buildOptions(this.token, this.endPoint, path, 'POST', body);
            return goCardlessRedirectRequest(options);
        }
    }, {
        key: 'getRedirectFlow',
        value: function getRedirectFlow(redirectFlowId) {
            var path = '/redirect_flows/' + redirectFlowId;
            var options = buildOptions(this.token, this.endPoint, path, 'GET');
            return goCardlessRedirectRequest(options);
        }
    }, {
        key: 'completeRedirectFlow',
        value: function completeRedirectFlow(redirectFlowId, sessionId) {
            var body = {
                "data": {
                    "session_token": sessionId
                }
            };
            var path = '/redirect_flows/' + redirectFlowId + '/actions/complete';
            var options = buildOptions(this.token, this.endPoint, path, 'POST', body);
            return goCardlessRedirectRequest(options);
        }

        /**
         * Sends a request for payment creation
         * https://developer.gocardless.com/pro/2015-07-06/#payments-create-a-payment
         * @param mandateID REQUIRED ID of the mandate against which payment should be collected
         * @param amount REQUIRED amount in pence, cents or öre
         * @param charge_date a future date on which the payment should be collected
         * @param currency defaults to EUR, either EUR, GBP or SEK
         * @param description human readable description sent to payer
         * @param metadata any data up to 3 pairs of key-values
         * @param internalReference your own internal reference
         */
    }, {
        key: 'createPayment',
        value: function createPayment(mandateID, amount) {
            var currency = arguments.length <= 2 || arguments[2] === undefined ? "EUR" : arguments[2];
            var chargeDate = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
            var description = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
            var metadata = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
            var internalReference = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];

            var body = {
                'payments': {
                    'amount': amount,
                    'currency': currency,
                    'charge_date': yyyymmdd(chargeDate),
                    'reference': internalReference || '',
                    'metadata': metadata,
                    'description': description || '',
                    'links': {
                        'mandate': mandateID
                    }
                }
            };
            var path = '/payments';
            var method = 'POST';
            var options = buildOptions(this.token, this.endPoint, path, method, body);
            return goCardlessRequest(options);
        }

        /**
         * retrieves single payment by id
         * https://developer.gocardless.com/pro/2015-07-06/#payments-get-a-single-payment
         * @param id
         */
    }, {
        key: 'getPayment',
        value: function getPayment(id) {
            var path = '/payments?' + id;
            var method = 'GET';
            var options = buildOptions(this.token, this.endPoint, path, method, null);
            return goCardlessRequest(options);
        }

        /**
         * List payments
         * https://developer.gocardless.com/pro/2015-07-06/#payments-list-payments
         * @param queryString
         */
    }, {
        key: 'queryPayments',
        value: function queryPayments(queryString) {
            var path = '/payments?' + queryString;
            var method = 'GET';
            var options = buildOptions(this.token, this.endPoint, path, method, null);
            return goCardlessRequest(options);
        }

        /**
         * Updates a payment Object, accepts only metadata
         * https://developer.gocardless.com/pro/2015-07-06/#payments-update-a-payment
         * @param id
         * @param metadata
         */
    }, {
        key: 'updatePayment',
        value: function updatePayment(id, metadata) {
            var path = '/payments?' + id;
            var method = 'PUT';
            var options = buildOptions(this.token, this.endPoint, path, method, metadata);
            return goCardlessRequest(options);
        }

        /**
         * Cancels a single payment if not already submitted to the banks, accepts only metadata
         * https://developer.gocardless.com/pro/2015-07-06/#payments-cancel-a-payment
         * @param id
         * @param metadata
         */
    }, {
        key: 'cancelPayment',
        value: function cancelPayment(id, metadata) {
            var path = '/payments?' + id + '/actions/cancel';
            var method = 'POST';
            var options = buildOptions(this.token, this.endPoint, path, method, metadata);
            return goCardlessRequest(options);
        }

        /**
         * retries a failed payment. you will receive a webhook.
         * https://developer.gocardless.com/pro/2015-07-06/#payments-retry-a-payment
         * @param id
         * @param metadata
         */
    }, {
        key: 'retryPayment',
        value: function retryPayment(id, metadata) {
            var path = '/payments?' + id + '/actions/retry';
            var method = 'POST';
            var options = buildOptions(this.token, this.endPoint, path, method, metadata);
            return goCardlessRequest(options);
        }
    }]);

    return GoCardless;
})();

exports['default'] = GoCardless;
module.exports = exports['default'];
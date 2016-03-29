var Promise = require('bluebird');
var request = require('request');

var pRequest = function(options) {
    return new Promise(function(resolve, reject) {
        request(options, function(err, response, body) {
            if (err) reject(err);
            resolve({ response: response, body: body });
        });
    });
};

function buildOptions(token, endPoint, path, method, body = {}) {
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
    }
}

function goCardlessRedirectRequest(options) {
    return pRequest(options)
        .then(function(response) {
            if (!response.body.redirect_flows) throw response.body;
            else return response.body;
        });
}

function goCardlessRequest(options) {
    return pRequest(options)
        .then((response) => {
            return response
        });
}

function yyyymmdd(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]); // padding
}

export default class GoCardless {

    constructor(config) {
        this.endPoint = config.sandbox ?
            'https://api-sandbox.gocardless.com' :
            'https://api.gocardless.com';
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
    request(method, path, body = null) {
        let options = buildOptions(this.token, this.endPoint, path, method, body);
        return goCardlessRequest(options);
    }

    startRedirectFlow(description, sessionId, succesRedirectUrl) {
        let body = {
            "redirect_flows": {
                "description": description,
                "session_token": sessionId,
                "success_redirect_url": succesRedirectUrl
            }
        };
        let path = '/redirect_flows';
        let options = buildOptions(this.token, this.endPoint, path, 'POST', body);
        return goCardlessRedirectRequest(options);
    }

    getRedirectFlow(redirectFlowId) {
        let path = '/redirect_flows/' + redirectFlowId;
        let options = buildOptions(this.token, this.endPoint, path, 'GET');
        return goCardlessRedirectRequest(options);
    }

    completeRedirectFlow(redirectFlowId, sessionId) {
        let body = {
            "data": {
                "session_token": sessionId
            }
        };
        let path = '/redirect_flows/' + redirectFlowId + '/actions/complete';
        let options = buildOptions(this.token, this.endPoint, path, 'POST', body);
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
    createPayment(mandateID, amount, currency = "EUR", chargeDate = null, description = null, metadata = null, internalReference = null) {

        const body = {
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
        const path = '/payments';
        const method = 'POST';
        const options = buildOptions(this.token, this.endPoint, path, method, body);
        return goCardlessRequest(options);
    }

    /**
     * retrieves single payment by id
     * https://developer.gocardless.com/pro/2015-07-06/#payments-get-a-single-payment
     * @param id
     */
    getPayment(id) {
        const path = `/payments?${id}`;
        const method = 'GET';
        const options = buildOptions(this.token, this.endPoint, path, method, null);
        return goCardlessRequest(options);
    }

    /**
     * List payments
     * https://developer.gocardless.com/pro/2015-07-06/#payments-list-payments
     * @param queryString
     */
    queryPayments(queryString) {
        const path = `/payments?${queryString}`;
        const method = 'GET';
        const options = buildOptions(this.token, this.endPoint, path, method, null);
        return goCardlessRequest(options);
    }

    /**
     * Updates a payment Object, accepts only metadata
     * https://developer.gocardless.com/pro/2015-07-06/#payments-update-a-payment
     * @param id
     * @param metadata
     */
    updatePayment(id, metadata) {
        const path = `/payments?${id}`;
        const method = 'PUT';
        const options = buildOptions(this.token, this.endPoint, path, method, metadata);
        return goCardlessRequest(options);
    }

    /**
     * Cancels a single payment if not already submitted to the banks, accepts only metadata
     * https://developer.gocardless.com/pro/2015-07-06/#payments-cancel-a-payment
     * @param id
     * @param metadata
     */
    cancelPayment(id, metadata) {
        const path = `/payments?${id}/actions/cancel`;
        const method = 'POST';
        const options = buildOptions(this.token, this.endPoint, path, method, metadata);
        return goCardlessRequest(options);
    }

    /**
     * retries a failed payment. you will receive a webhook.
     * https://developer.gocardless.com/pro/2015-07-06/#payments-retry-a-payment
     * @param id
     * @param metadata
     */
    retryPayment(id, metadata) {
        const path = `/payments?${id}/actions/retry`;
        const method = 'POST';
        const options = buildOptions(this.token, this.endPoint, path, method, metadata);
        return goCardlessRequest(options);
    }
}

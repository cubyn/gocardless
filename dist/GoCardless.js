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

function goCardlessRequest(options) {
    return pRequest(options).then(function (response) {
        if (!response.body.redirect_flows) throw response.body;else return response.body;
    });
}

var GoCardless = (function () {
    function GoCardless(config) {
        _classCallCheck(this, GoCardless);

        this.endPoint = config.sandbox ? 'https://api-sandbox.gocardless.com' : 'https://api.gocardless.com';
        if (!config.token) throw new Error('missing config.token');
        this.token = config.token;
    }

    _createClass(GoCardless, [{
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
            return goCardlessRequest(options);
        }
    }, {
        key: 'getRedirectFlow',
        value: function getRedirectFlow(redirectFlowId) {
            var path = '/redirect_flows/' + redirectFlowId;
            var options = buildOptions(this.token, this.endPoint, path, 'GET');
            return goCardlessRequest(options);
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
            return goCardlessRequest(options);
        }
    }]);

    return GoCardless;
})();

exports['default'] = GoCardless;
module.exports = exports['default'];
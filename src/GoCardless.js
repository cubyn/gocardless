var Promise = require('bluebird');
var request = require('request');

var pRequest = function(options){
    return new Promise(function (resolve, reject){
        request(options, function (err, response, body){
            if(err) reject(err);
            resolve({response: response, body: body});
        });
    });
}

function buildOptions(token, endPoint, path, method, body = {}){
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

function goCardlessRequest(options){
    return pRequest(options)
            .then(function (response){
                if(!response.body.redirect_flows) throw response.body;
                else return response.body;
            });
}

export default class GoCardless {

    constructor(config) {
        this.endPoint = config.sandbox ?
            'https://api-sandbox.gocardless.com' :
            'https://api.gocardless.com';
        if(!config.token) throw new Error('missing config.token');
        this.token = config.token;
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
        return goCardlessRequest(options);
    }

    getRedirectFlow(redirectFlowId) {
        let path = '/redirect_flows/' + redirectFlowId;
        let options = buildOptions(this.token, this.endPoint, path, 'GET');
        return goCardlessRequest(options);
    }

    completeRedirectFlow(redirectFlowId, sessionId) {
        let body = {
            "data": {
                "session_token": sessionId
            }
        };
        let path = '/redirect_flows/' + redirectFlowId + '/actions/complete';
        let options = buildOptions(this.token, this.endPoint, path, 'POST', body);
        return goCardlessRequest(options);
    }

}

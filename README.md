# GoCardless Node.js Library

Supports the redirection flow API at the time of writing.

## Simple steps

1. Instantiate GoCardless with your access_token.
2. Create a redirection flow
3. User fills in information on GoCardless
4. User is redirected to your success_url
5. Complete redirection flow

### 1. Instantiate GoCardless

```javasript
var GoCardless = require('GoCardless');

var config = {
	sandbox: true, //optional
	token: 'YOUR_SECRET_ACCESS_TOKEN'
};

var goCardless = new GoCardless(config);

```

### 2. Create a redirection flow

```javascript
var description = 'optional description';
var sessionToken = 'userSessionToken';
var successUrl = 'http://example.com/gocardless/success';

goCardless.startRedirectionFlow(description, sessionToken, successUrl)
	.then(function (response){
		console.log(response);
	});
```

this logs : 
```
{ id: 'RE00001VVPM6J4BQT82TZMFBC6QCPPBR',
     description: 'description',
     session_token: 'test5',
     scheme: null,
     success_redirect_url: 'http://localhost:3000/gocardless/success',
     created_at: '2015-10-23T14:22:25.693Z',
     links: { creditor: 'CR00000Q17V7D4' },
     redirect_url: 'https://pay-sandbox.gocardless.com/flow/RE00001VVPM5J4BQT82TZMFBC6QCPPBR' } }
```

### 5. Complete redirection flow

to be completed ...
# GoCardless Node.js Library

Supports the redirection flow API at the time of writing.

## Simple steps

1. Instantiate GoCardless with your access_token.
2. Create a redirection flow
3. User fills in information on GoCardless
4. User is redirected to your success_url
5. Complete redirection flow

### 1. Instantiate GoCardless

```javascript
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
{ redirect_flows: 
   { id: 'RE00001VVBSW46DZSK57ZKK7V654C6T3',
     description: 'optional description',
     session_token: 'userSessionToken',
     scheme: null,
     success_redirect_url: 'http://example.com/gocardless/success',
     created_at: '2015-10-23T13:52:42.921Z',
     links: { creditor: 'CR00003Q16V7D3' },
     redirect_url: 'https://pay-sandbox.gocardless.com/flow/RE00001VVBSW46DZSK57ZKK7V754C6T3' } }

```

### 5. Complete redirection flow

to be completed ...
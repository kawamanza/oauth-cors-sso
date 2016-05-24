# OAuth CORS SSO

OAuth Single-SignOn with Ajax+CORS

Code badges:  
[![Build Status](https://travis-ci.org/kawamanza/oauth-cors-sso.svg?branch=master)](https://travis-ci.org/kawamanza/oauth-cors-sso)
[![Coverage Status](https://coveralls.io/repos/github/kawamanza/oauth-cors-sso/badge.svg?branch=master)](https://coveralls.io/github/kawamanza/oauth-cors-sso?branch=master)
[![bitHound Overall Score](https://www.bithound.io/github/kawamanza/oauth-cors-sso/badges/score.svg)](https://www.bithound.io/github/kawamanza/oauth-cors-sso)
[![bitHound Code](https://www.bithound.io/github/kawamanza/oauth-cors-sso/badges/code.svg)](https://www.bithound.io/github/kawamanza/oauth-cors-sso)

## Requirements

### A Signer Service

This web-component requires a service into your website to sign the OAuth base-string. The signer service should be implemented according to the following specification:

+ Request

        POST /signer HTTP/1.1
        Host: www.my-website.com
        Content-Type: application/x-www-form-urlencoded; charset=UTF-8
        X-Requested-With: XMLHttpRequest
        Accept: application/json, text/javascript, */*; q=0.01
        Cookie: session_id=1ab5c
        
        _csrf_token=123456&baseString=GET%26http%253A%252F%252Fsso.another-website.com%252Fgrant%26oauth_consumer_key%253Dkey%2526...

+ Response

        HTTP/1.1 200 Ok
        Content-Type: application/json; charset=UTF-8
        
        {"signature":"base_string_signed","userData":{"name":"John","email":"john@email.me"}}

## Configuration

Include the web-component on the page and make its setup:

```html
<script type="text/javascript" src="/js/jquery.js"></script>
<script type="text/javascript" src="/js/oauth-cors-sso.js"></script>
<script type="text/javascript">
        function redirectToExternalWebapp(event) {
                var oauth;
                if (event) event.preventDefault();
                oauth = new OAuthSSO({
                        "sso": {
                                "service_url": "https://sso.external-webapp.com/sso-service/products",
                                "consumer_key": "my_granted_webapp_source"
                        },
                        "signer": {
                                "path": "/external-webapp-signer",
                                "csrf_param": {
                                        "name": "_csrf_token",
                                        "value": "1a5bc"
                                }
                        }
                });
                oauth.auth(function (external_webapp_url) {
                        window.location = external_webapp_url;
                });
        }
</script>
```

Usage example:

```html
<html>
<head>
  <!-- add the scripts here -->
</head>

<body>
  <a href="javascript: redirectToExternalWebapp(event)">Go to external WebApp!</a>
</body>
</html>
```

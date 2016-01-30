# OAuth CORS SSO

OAuth Single-SignOn with Ajax+CORS

Code badges:  
[![Build Status](https://travis-ci.org/kawamanza/oauth-cors-sso.svg?branch=master)](https://travis-ci.org/kawamanza/oauth-cors-sso)
[![Coverage Status](https://coveralls.io/repos/github/kawamanza/oauth-cors-sso/badge.svg?branch=master)](https://coveralls.io/github/kawamanza/oauth-cors-sso?branch=master)

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

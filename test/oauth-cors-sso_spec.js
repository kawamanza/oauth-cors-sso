describe("Calling /signer of current webapp", function () {
	it("expects to sign the Signature-Base-String by Ajax", function(done) {
		var oauth = new OAuthSSO({
			signer: {
				path: "/signer",
				csrf_param: {
					name: "_csrf_token",
					value: ""
				}
			}
		});
		var baseString = [
			"GET",
			"http%3A%2F%2Flocal-sso.panel.my-webapp.com%3A9001%2Fsso%2Fintranet",
			"oauth_consumer_key%3Dkey%26oauth_nonce%3Dnonce%26oauth_signature_method%3DRSA-SHA1%26oauth_timestamp%3D1452686123%26oauth_version%3D1.0"
		].join("&");
		var oauth_signature = "NMq95NIkIi+659uoTfqxM7voTk7JYVTBp5awpC1/9XoA0pAxz3PT9f/9TG1+CdOyPtizAc5G+wh/PAuJ2jdGkbvodI351MnUxVh4qzFKpAd9S1Vlxdmsi0ZiAEbOOqdB6Odgv6C9tK/A3X3iHA2k+hdqm2Q0tJ3z0Di0TKb62Q9XGlYzkmsz3k44AakN6hnW52bQ9bbxHS9jcv37RKCHF/gSCOrp349thGE9tZZ+kqaeetdyhl2THaSy3wuUgDGmdmOwHoyO1rET1wPjAZiX0dFobYQw/EgV2ogfxMAB8HyklRRih2CNXXmlDuIZYuSi8vPspvCVCM8bNMVFclpwew==";
		oauth.sign(baseString, function (error, data) {
			expect(error).toBeUndefined();
			expect(data).toEqual({signature: oauth_signature, userData: {name: "John", email: "john@email.me"}});
			done();
		});
	});
});

describe("Creating authenticated session into external domain", function () {
	it("expects to set the session cookie to the external webapp", function (done) {
		var oauth = new OAuthSSO({
			sso: {
				service_url: "http://local-sso.panel.my-webapp.com:9001/sso/intranet",
				consumer_key: "key"
			},
			signer: {
				path: "/signer",
				csrf_param: {
					name: "_csrf_token",
					value: ""
				}
			}
		});
		oauth.auth(function (destination_href) {
			expect(destination_href).toEqual("http://local-intranet.panel.my-webapp.com:9001/");
			$.ajax(destination_href, {
				method: "GET",
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				},
				statusCode: {
					200: function (data, textStatus, jqXHR) {
						expect(data).toEqual({cookies: {_my_panel_session_token: expectedTokens._my_panel_session_token}});
						done();
					}
				}
			});
		});
	});
});

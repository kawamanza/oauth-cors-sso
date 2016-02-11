;(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('jquery'));
	} else {
		factory(this.jQuery || this.Zepto);
	}
})(function ($) {
	var window = this;
	window.OAuthSSO = OAuthSSO;

	function OAuthSSO(options) {
		this.options = options;
	}

	OAuthSSO.prototype.sign = function (baseString, callback) {
		var data, signer;
		signer = this.options.signer;
		data = {baseString: baseString};
		if (typeof signer.csrf_param === "object") {
			data[signer.csrf_param.name] = signer.csrf_param.value;
		}

		// See http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
		$.ajax(signer.path, {
			method: "POST",
			data: data,
			dataType: "json",
			statusCode: {
				403: function (jqXHR, textStatus, errorThrown) {
					callback("forbidden", {});
				},
				200: function (data, textStatus, jqXHR) {
					callback(void(0), data);
				}
			}
		});
	};

	OAuthSSO.prototype.headerParams = function () {
		return {
			oauth_consumer_key: this.options.sso.consumer_key,
			oauth_nonce: oauth_nonce(),
			oauth_timestamp: oauth_timestamp(),
			oauth_signature_method: "RSA-SHA1",
			oauth_version: "1.0"
		};
	};

	OAuthSSO.prototype.baseString = function (params) {
		return [
			"POST",
			baseStringUrl(this.options.sso.service_url),
			baseStringParams(params || this.headerParams())
		].join("&");
	};

	OAuthSSO.prototype.auth = function (callback) {
		var oauth, oauthParams;
		oauth = this;
		oauthParams = oauth.headerParams();
		waterfall([
			function (callback) {
				oauth.sign(oauth.baseString(oauthParams), callback);
			},
			function (data, callback) {
				oauthParams.oauth_signature = data.signature;
				$.ajax(oauth.options.sso.service_url, {
					method: "POST",
					data: JSON.stringify({userData: data.userData}),
					dataType: "json",
					contentType: "application/json; charset=UTF-8",
					crossDomain: true,
					jsonp: false,
					xhrFields: {
						withCredentials: true
					},
					beforeSend: function (xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + dumpOAuthHeader(oauthParams));
					},
					statusCode: {
						200: function (data, textStatus, jqXHR) {
							callback(null, data.location_href);
						}
					}
				});
			}
		], function (error, href) {
			if (!error) {
				callback(href);
			}
		});
	};

	function waterfall(tasks, callback) {
		var iterator = tasks.slice(0);
		function next(err) {
			if (err || !iterator.length) {
				callback.apply(null, arguments);
			} else {
				var args = iterator.slice.call(arguments, 1);
				args.push(next);
				iterator.shift().apply(null, args);
			}
		}
		next();
	}

	// Utils

	// See: http://oauth.net/core/1.0/#encoding_parameters
	function rfc3986_oauth_encode(content) {
		var escaped_chars;
		escaped_chars = /[^0-9a-zA-Z%\-\._~]/g;
		return encodeURIComponent(content).replace(escaped_chars, escape);
	}

	// OAuth helpers

	function oauth_nonce(length) {
		var pLen, possible, text;
		text = "";
		possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		pLen = possible.length;
		if (!length) {
			length = Math.floor(Math.random() * 8) + 8;
		}
		for (var i = 0; i < length; i++) {
				text += possible.charAt(Math.floor(Math.random() * pLen));
		}
		return text;
	}

	function oauth_timestamp() {
		return (new Date().getTime() / 1000) | 0;
	}

	function baseStringUrl(url) {
		return rfc3986_oauth_encode(url.toLowerCase());
	}

	function baseStringParams(params) {
		return rfc3986_oauth_encode($.param(params));
	}

	function dumpOAuthHeader(oauthParams) {
		// TODO: encode string acording to OAuth Spec
		return $.param(oauthParams).split("&").join(",").replace(/([^,=]+)=([^,]+)/g, "$1=\"$2\"");
	}

});

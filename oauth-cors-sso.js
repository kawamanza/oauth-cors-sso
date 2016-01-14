;(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('jquery'));
	} else {
		factory(this.jQuery || this.Zepto);
	}
})(function ($) {
	this.OAuthSSO = OAuthSSO

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

});

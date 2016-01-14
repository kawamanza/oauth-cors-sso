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
					callback(void(0), data.signature);
				}
			}
		});
	};
});

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
		var baseString = "GET";
		var signedBaseString = "BLA";
		oauth.sign(baseString, function (error, signature) {
			expect(error).toBeUndefined();
			expect(signature).toBe(signedBaseString);
			done();
		});
	});
});

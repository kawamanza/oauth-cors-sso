module.exports = (grunt) ->
	qs = require 'querystring'
	crypto = require 'crypto'

	routes =
		GET:
			'/new_session.js': (req, res, next) ->
				res.setHeader "Set-Cookie", "_my_session_token=1ab5c"
				res.setHeader "Content-Type", "text/javascript; charset=UTF-8"
				res.end ""
				return
		POST:
			'/signer': (req, res, next) ->
				if req.cookies._my_session_token isnt "1ab5c"
					res.writeHead 403, "Content-Type": "application/json; charset=UTF-8"
					res.end "{}"
					return
				signer = crypto.createSign "RSA-SHA1"
				signer.update req.params.baseString
				signature = signer.sign grunt.file.read("test/rsakeys/cert.priv.key"), "base64"
				res.setHeader "Content-Type", "application/json; charset=UTF-8"
				res.end JSON.stringify({signature: signature})
				return

	helpers =
		middlewares:
			parse_post_body: (req, res, next) ->
				return next() unless req.method is "POST"
				body = ""
				req.on "data", (data) ->
					body += data
					req.connection.destroy() if body.length > 1e6
					return
				req.on "end", ->
					req.body = body
					if /^application\/x-www-form-urlencoded/.test req.headers['content-type']
						req.params = qs.parse body
					next()
				return
			parse_cookies: (req, res, next) ->
				cookies = req.headers.cookie
				req.cookies = {}
				return next() unless cookies?
				for cookie in cookies.split(';')
					parts = cookie.split('=')
					req.cookies[parts.shift().trim()] = decodeURI(parts.join('='))
				next()
			known_route_service: (req, res, next) ->
				service = routes[req.method]?[req.url]
				return next() unless service?
				service req, res, next
				return

	grunt.initConfig
		connect:
			server:
				options:
					port: 9001
					hostname: '*'
					base: '.'
					middleware: (connect, options, middlewares) ->
						middlewares[-1..-2] = [
							helpers.middlewares.parse_post_body
							helpers.middlewares.parse_cookies
							helpers.middlewares.known_route_service
						]
						middlewares
		jasmine:
			options:
				vendor: [
					'test/vendor/*.js'
				]
				helpers: [
					'new_session.js'
				]
				host: 'http://localhost:<%= connect.server.options.port %>/'
				specs: [
					'test/*_spec.js'
				]
			src: [
				'oauth-cors-sso.js'
			]

	grunt.loadNpmTasks "grunt-contrib-connect"
	grunt.loadNpmTasks "grunt-contrib-jasmine"

	grunt.registerTask 'test', [
		'connect'
		'jasmine'
	]

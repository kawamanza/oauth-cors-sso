module.exports = (grunt) ->
	qs = require 'querystring'
	crypto = require 'crypto'
	tokens =
		_my_session_token: "1ab5c"
		_signer_csrf_token: "1ab5c_csrf"
		_my_panel_session_token: "1234567"

	routes =
		GET:
			'/': (req, res, next) ->
				res.setHeader "Content-Type", "application/json; charset=UTF-8"
				res.end JSON.stringify(cookies: req.cookies)
				return
			'/my_current_session_mock.js': (req, res, next) ->
				res.setHeader "Set-Cookie", "_my_session_token=#{tokens._my_session_token}"
				res.setHeader "Content-Type", "text/javascript; charset=UTF-8"
				res.end "var expectedTokens = #{JSON.stringify(tokens)};"
				return
		POST:
			'/signer': (req, res, next) ->
				# check active session
				if req.cookies._my_session_token isnt tokens._my_session_token
					res.writeHead 403, "Content-Type": "application/json; charset=UTF-8"
					res.end JSON.stringify req.cookies
					return
				if req.params._csrf_token isnt tokens._signer_csrf_token
					res.writeHead 412, "Content-Type": "application/json; charset=UTF-8"
					res.end JSON.stringify req.params
					return
				signer = crypto.createSign "RSA-SHA1"
				signer.update req.params.baseString
				signature = signer.sign grunt.file.read("test/rsakeys/cert.priv.key"), "base64"
				res.setHeader "Content-Type", "application/json; charset=UTF-8"
				res.end JSON.stringify
					signature: signature
					userData:
						name: "John"
						email: "john@email.me"
				return
			'/sso/intranet': (req, res, next) ->
				# TODO: check Authorization header
				res.setHeader "Content-Type", "application/json; charset=UTF-8"
				expires = new Date()
				expires.setTime(expires.getTime() + 3600000)
				res.setHeader "Set-Cookie", "_my_panel_session_token=#{tokens._my_panel_session_token}; path=/; domain=.panel.my-webapp.com; expires=#{expires.toGMTString()}"
				res.end JSON.stringify({location_href: "http://local-intranet.panel.my-webapp.com:9001/"})
				return
		OPTIONS:
			'/sso/intranet': (req, res, next) ->
				res.setHeader "Accept-Method", "POST"
				res.end ''
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
			allow_origin_response: (req, res, next) ->
				if req.headers['x-requested-with'] or req.headers.origin
					res.setHeader "Access-Control-Allow-Origin", req.headers.origin
					res.setHeader "Access-Control-Allow-Headers", "authorization, content-type, x-requested-with"
					res.setHeader "Access-Control-Expose-Headers", "cookie, location, set-cookie"
					res.setHeader "Access-Control-Allow-Credentials", true
				next()

	grunt.initConfig
		bower:
			install:
				options:
					targetDir: './test/vendor'
		connect:
			server:
				options:
					# keepalive: true
					port: 9001
					hostname: '*'
					base: '.'
					middleware: (connect, options, middlewares) ->
						middlewares[-1..-2] = [
							helpers.middlewares.parse_post_body
							helpers.middlewares.parse_cookies
							helpers.middlewares.allow_origin_response
							helpers.middlewares.known_route_service
						]
						middlewares
		jasmine:
			options:
				# keepRunner: true
				vendor: [
					'test/vendor/**/*.js'
				]
				helpers: [
					'my_current_session_mock.js'
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
	grunt.loadNpmTasks "grunt-bower-task"

	grunt.registerTask 'test', [
		'bower:install'
		'connect'
		'jasmine'
	]

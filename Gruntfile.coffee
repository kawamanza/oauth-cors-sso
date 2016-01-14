module.exports = (grunt) ->

	routes =
		'/sign': (req, res, next) ->
			throw new Error "not implemented"
			return

	helpers =
		middlewares:
			known_route_service: (req, res, next) ->
				service = routes[req.url]
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
							helpers.middlewares.known_route_service
						]
						middlewares
		jasmine:
			options:
				vendor: [
					'test/vendor/*.js'
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

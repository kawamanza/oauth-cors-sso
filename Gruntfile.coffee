module.exports = (grunt) ->

	routes =
		'/sign': (req, res, next) ->
			throw new Error "not implemented"
			return

	grunt.initConfig
		connect:
			server:
				options:
					port: 9001
					hostname: '*'
					base: '.'
					middleware: (connect, options, middlewares) ->
						middlewares.unshift (req, res, next) ->
							return next() if req.url isnt '/sign'
							service = routes[req.url]
							return next() unless service?
							service req, res, next
							return
						middlewares
		jasmine:
			options:
				vendor: [
					'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'
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

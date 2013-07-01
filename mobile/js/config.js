require.config({
	baseUrl: 'js/',
	paths: {
		'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min',
		'bootstrap': '//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/js/bootstrap'
	},
	shim: {
		'bootstrap': {
			deps: ['jquery']
		},
		'jquery.jplayer.min': {
			deps:	['jquery']
		},
		'jquery.bbgPlayer': {
			deps: ['jquery','jquery.jplayer.min']
		},
		'jquery.bbgPlayer.dev': {
			deps: ['jquery','jquery.jplayer.min']
		},
		'jquery.jpanelmenu': {
			deps: ['jquery']
		},
		'qRespond.min': {
			deps: ['jquery']
		}
	}
});
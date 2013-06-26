require.config({
	baseUrl: 'js/',
	paths: {
		'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min'
	},
	shim: {
		'jquery.jplayer.min': {
			deps:	['jquery']
		},
		'jquery.bbgPlayer': {
			deps: ['jquery','jquery.jplayer.min']
		},
		'jquery.bbgPlayer.dev': {
			deps: ['jquery','jquery.jplayer.min']
		}
	}
});
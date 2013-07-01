require.config({
	baseUrl: 'js/',
	paths: {
		'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min',
		'jquery.bbgPlayer.config': 'jquery.bbgPlayer.config.mbn'
	},
	shim: {
		'jquery.jplayer.min': {
			deps:	['jquery']
		}
	}
});
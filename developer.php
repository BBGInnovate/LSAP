<html>
<head>
	<title>BBG Shareable Player</title>
	<script type="text/javascript" src="js/lazyload-min.js"></script>
</head>
<body>

		<div id="jquery_jplayer_1" class="jp-jplayer"></div>

		<div id="jp_container_1" class="jp-audio-stream">
			<p><a href="javascript:;" class="jp-play">play</a><a href="javascript:;" class="jp-pause" tabindex="1">pause</a><br />
			<a href="javascript:;" class="jp-mute" title="mute">mute</a><a href="javascript:;" class="jp-unmute" title="unmute">unmute</a> |
			<a href="javascript:;" class="jp-volume-max" title="max volume">max volume</a><br />
			<a href="javascript:;" class="jp-share" title="share">share</a> | <a href="javascript:;" class="jp-pop" title="pop">pop</a></p>
			 
			<li class="song"></li><br />
			<li class="station"></li><br />

			<div class="jp-share-panel">
				<span>Share</span>
				Copy the following to embed the player:<br />
				<textarea name="embedCode" class="jp-share-code" readonly></textarea><br />
				<a href="javascript:;" class="share-hide" title="hide">Hide</a>
			</div>
			<div class="jp-no-solution">
				<span>Update Required</span>
				To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.
			</div>
			
			<div class="jp-stream-list">
				<ul class="jp-streams"></ul>
			</div>
		</div>
	
<script type="text/javascript">	
	// initialize Google Analytics Tracking Code
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-25348602-1']);
	_gaq.push(['_trackPageview']);
	
	(function() {
	  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
	
	// Load multiple JS files and execute a callback when they've all finished.
	LazyLoad.js(['http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js', 'js/jquery.jplayer.min.js', 'js/jquery.bbgPlayer.dev.js'], function () {
	// initialize player
		var stream = {
			mp3: 'http://sc9.iad.llnw.net/stream/npr_music2',
			title: 'Channel 1: Our Awesome Radio App',
			description: 'An Awesome Radio Web App from ODDI',
			siteurl: 'http://ourawesomewebapp.com'
		}
		$("#jquery_jplayer_1").bbgPlayer({
			bbgCssSelectors: {
				title:	'li.song',
				station: 'li.station'
			},
			//overrideStream: stream,
			config: 'mbn',
			trackingEnabled: true,
			metadataStreamEnabled: true,
			playerOpts: {
				size: { 
					width: 236,
					height: 143
				}
			}
		});
	});
</script>

</body>
</html>
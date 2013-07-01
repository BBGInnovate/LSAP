<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
	<title>BBG General Player</title>
	<link rel="stylesheet" href="skin/bbgPlayerMain.css">
	<link rel="stylesheet" href="skin/bbgAudioPlayer.css">
	<script type="text/javascript" src="js/require.js"></script>
	<script type="text/javascript" src="js/config.js"></script><!-- used instead of data-main due to bugs in ie9 loading order -->

</head>
<body>

<div id="container">
	<div class="bbg-player-branding"><a></a></div>

	<div id="jquery_jplayer_1" class="jp-jplayer"></div>
	<div id="jp_container_1" class="jp-audio">
		<div class="jp-control-container">
			<ul class="jp-controls">
				<li><a href="javascript:;" class="jp-play" title="play">play</a></li>
				<li><a href="javascript:;" class="jp-pause" title="pause">pause</a></li>
				<li><a href="javascript:;" class="jp-mute" title="mute">mute</a></li>
				<li><a href="javascript:;" class="jp-unmute" title="unmute">unmute</a></li>
			</ul>
			<div class="jp-current-time"></div>
			<div class="jp-status">
				<span class="jp-status-connecting"></span>
				<span class="jp-status-streaming"></span>
				<span class="jp-status-paused"></span>
				<span class="jp-status-ended"></span>
			</div>
			<div class="jp-volume-bar">
				<div class="jp-volume-bar-value"></div>
			</div>
		</div>
		<div class="jp-no-solution">
			<span>Update Required</span>
			To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.
		</div>
		<div class="jp-onair"> 
			<p class="onairnow"><strong>On Air Now</strong></p>
			<div class="onairnow jp-station"></div>
			<div class="jp-song"></div>
		</div>
        <div class="jp-social">
        <ul></ul>
        </div>
        <div class="jp-poster"></div>
        <div class="jp-share-panel">
			<span class="instructions"></span><br />
			<textarea name="embedCode" class="jp-share-code" readonly></textarea><br />
			<input type="button" class="share-hide" value="">
		</div>
	</div><!--  /#jp-container_1 -->
	<div id="footer"></div>
</div><!-- /#container -->

			
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
	
	// Player Initialization
	require(['util','jquery.bbgPlayer'],function(util) {
		var config = util.getUrlParameter('c');
		if (!config) {
			config = 'general';
		}
		$("#jquery_jplayer_1").bbgPlayer({
			overrideStream: null,
			config: config,
			trackingEnabled: true,
			metadataStreamEnabled: true,
			showPosters: true,
			playerOpts: {
				cssSelectorAncestor: '#container'
			}
		});
	}); 
</script>

</body>
</html>
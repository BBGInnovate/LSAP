<!DOCTYPE html>
<html>
<head>
<?php 
/**
 * BBG Affiliate embedded player.  This player allows the affiliates to embed a configured player into their web pages.  
 * Code is hosted centrally to allow for maintenance purposes.
 * 
 * REQUIRES:
 * url.c:		Configuration to load - this should be the filename of the config file without the file extension
 * OR
 * url.l:		A single stream to play within a player
 * 
 * AND
 * url.s:		The style to load for this player - this should be the filename of the css file without the extension
*/
?>
	<title>Live Streaming Player</title>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery.jplayer.min.js"></script>
	<script type="text/javascript" src="js/jquery.bbgPlayer.js"></script>
</head>
<body>

<div id="jquery_jplayer_1" class="jp-jplayer"></div>

<div id="jp_container_1" class="jp-audio-stream">
	<div class="top">
		<div class="jp-stream-list">
			<ul class="jp-streams"></ul>
		</div>
		<div class="poster_holder">
			<div class="jp-loading"></div>
			<div class="jp-poster"></div>
		</div>
	</div>
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
			<div class="jp-volume-bar-value">
		</div>
	</div>

	<div class="jp-no-solution">
		<span>Update Required</span>
		To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.
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

	function getURLParameter(name) {
	    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	}

	$(document).ready(function() {
		// load the style sheet
		var styleFile = getURLParameter('s');
		if (styleFile) {
	        $.ajax({
	            url:"skin/" + styleFile + ".css",
	            dataType:"text",
	            success:function(data){
	                $("head").append("<style>" + data + "</style>");
	        		// instantiate the player
	        		var requestedStream = getURLParameter('l');
	        		var requestedConfig = getURLParameter('c');
	        		var requestedStreamObj = null;
	        		if (requestedStream && requestedStream.length > 0) {
	        			requestedStreamObj = {mp3: requestedStream};
	        		}
	        		if ((requestedStreamObj)
	        				|| requestedConfig && requestedConfig.length > 0) {
	        			$("#jquery_jplayer_1").bbgPlayer({		
		        			overrideStream: requestedStreamObj,
		        			config: requestedConfig,
		        			trackingEnabled: true,
		        			embedded: true,
		        			metadataStreamEnabled: true,
		        			autoplay: false
	        			}); 
	        		} else {
	        			alert("No stream requested.  Cannot continue.");
	        		}
	        	}
	        });
		}
	});
</script>

</body>
</html>
/**
 * BBG Audio Streaming Player jQuery plugin
 * Requires jQuery and jPlayer
 * 
 */
;(function($) {

	function BBGPlayer(elem, options) {
		var self = this;
		self.$elem = $(elem);
		
		var defaults = {
			playerOpts: {},
			titleSel: 'div.jp-title ul li.song',
			stationSel: 'div.jp-title ul li.station',
			shareSel: 'div.jp-share',
			shareLinkSel: '.jp-other-controls a.jp-share',
			trackingEnabled: false,
			metadataStreamEnabled: false, // true to read dynamic metadata encoded in stream
			metadataCheckInterval: 10, // number of seconds in between checks for changes in metadata
			currentStream: null,
			streamSel: 'ul.jp-streams',
			streamXmlUrl: null,
			trackIncrement: 10, // number of seconds in between duration tracking calls
			overrideTitle: null, // a title to display instead of dynamic metadata
			embedded: false, // indicates if this is an embedded player (behaves differently)
			popped: false, // indicates if this is a popped out player
			popLinkSel: '.jp-other-controls a.jp-pop'
		}
		self.options = $.extend({},defaults,options);
		
		self.config = {
			embedPlayer: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/developer.php',
			popoutPlayer: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/popped.php',
			metadataRemoteService: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/metadata/remote.streaminfo.php', //url to remote file that reads metadata - should be on same domain as it uses json
		}
		
		init();
	
		function init() {
			var ready = false;
			var streamingEnabled = false;
			var nextTrackTime = self.options.trackIncrement;
			
			// initialize player
			self.$elem.jPlayer({
				ready: function (event) {
					ready = true;
					playStream();
					trackPlayer();
					if (self.options.metadataStreamEnabled) {
						loadMetadata();
					}
				},
				play: function(event) {
					if (self.options.trackingEnabled) {
						nextTrackTime = self.options.trackIncrement; // reset the tracking time
						// has been an the specified amount since the last log so log it for duration purposes
						trackStart(getMediaTitleForTracking(event));
					}
					setTitle(self.options.currentStream.title);
					if (self.options.currentStream.siteurl) {
						setStation('<a href="' + self.options.currentStream.siteurl + '">' + self.options.currentStream.siteurl + '</a>');
					} else {
						setStation();
					}
				},
				ended: function(event) {
					if (self.options.trackingEnabled) {
						trackEnd(getMediaTitleForTracking(event),event.jPlayer.status.currentTime);
						clearMetadata();
					}
				},
				pause: function(event) {
					if (self.options.trackingEnabled) { // pause gets called when switching streams in which case this is not set....
						trackPause(getMediaTitleForTracking(event),event.jPlayer.status.currentTime);
					}
					self.$elem.jPlayer("clearMedia");
				},
				timeupdate: function(event) {
					if (self.options.trackingEnabled && event.jPlayer.status.currentTime > 0 && event.jPlayer.status.currentTime > nextTrackTime) {
						// has been an the specified amount since the last log so log it for duration purposes
						trackDuration(getMediaTitleForTracking(event),event.jPlayer.status.currentTime);
						nextTrackTime += self.options.trackIncrement;
					}
				},
				error: function(event) {
					var getFlashUrl = 'http://get.adobe.com/flashplayer';
					if(ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
						// Setup the media stream again and play it.
						self.$elem.jPlayer("setMedia", self.options.currentStream).jPlayer("play");
					} else if (event.jPlayer.error.type === $.jPlayer.error.FLASH || event.jPlayer.error.type === $.jPlayer.error.FLASH_DISABLED) {
						// flash insertion problem or disabling issue
						alert('There is a problem with your Flash installation.\n\nPlease visit ' + getFlashUrl + ' to update your Flash Player.');
					} else if (event.jPlayer.error.type == $.jPlayer.error.NO_SOLUTION || event.jPlayer.error.type == $.jPlayer.error.NO_SUPPORT) {
						if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
							// if ios then its a problem with with browser support for supplied audio format
							alert('The audio streaming format is not supported on your device.  Please visit this site in your browser or other device to continue.');
						} else {
							// if not ios then the solution is to install flash and they should be able to handle all formats
							upgrade = window.confirm('Please update your browser to a more recent version or install the Adobe Flash Plugin.\n\n Install Flash Player?');
							if (upgrade) {
								window.location = getFlashUrl;
							}
						}
						
					}
				},
				solution: "flash,html",
				swfPath: "/ovap/LSAP/js",
				supplied: 'mp3',
				preload: "none",
				wmode: "window",
				keyEnabled: true,
				warningAlerts: false,
				errorAlerts: false,
		    }); // end jPlayer definition
			
			// additional jPlayer options
			if (typeof(self.options.playerOpts) != 'undefined') {
				for (var optName in self.options.playerOpts) {
					self.$elem.jPlayer( "option", optName, self.options.playerOpts[opt]);
				}
			}		
			
			// handle stream generation
			if (self.options.streamXmlUrl != null) {
				streamingEnabled = true;
				generateStreams(self.options.streamXmlUrl);
			}
			
			// set up sharing
			if (self.options.shareSel && self.options.shareSel.length > 0 
					&& self.options.shareLinkSel && self.options.shareLinkSel.length > 0) {
				$(self.options.shareLinkSel).on('click',function(e) {
					displayShareOptions();
				});
				$(self.options.shareSel).hide();
				$(self.options.shareLinkSel).show();
			}
			
			// set out pop out function
			if (!self.options.popped && self.options.popLinkSel.length > 0) {
				$(self.options.popLinkSel).on("click",function(e) {
					trackPop()
					window.open(self.config.popoutPlayer + '?l=' + self.options.currentStream.mp3,
						'BBGPlayer',
						'width=600,height=400,left=150,top=150,location=no,menubar=no,toolbar=no');
					self.$elem.jPlayer("pause");
				})
			}
		} // end init
		
// STREAM LISTS & SWITCHING
		/**
		 * Generates the stream data from an external url
		 * @param streamUrl url to stream xml file
		 * @param streamSel the jQuery selector for the streams list element
		 */
		function generateStreams(streamXmlUrl,streamSel) {
			$.ajax({
				url: streamXmlUrl,
				success: function(xml) {
					streams = new Array();
					$(xml).find("item").each(function(i){
						streams.push({
							title: $(this).find("title").text(),
							stream: $(this).find("streamUrl").text(),
							format: $(this).attr("format"),
							type: $(this).attr("type"),
							description: $(this).find("description").text(),
							siteurl: $(this).find("siteUrl").text()
						});
					});
					displayStreams(streams,streamSel);
				},
				dataType: 'xml'
			});
		}
		
		/**
		 * Displays the stream list from streaming data
		 * @param streams the streaming data (see generateStreams)
		 * @param streamSel the jQuery selector for the streams list element
		 */
		function displayStreams(streams,streamSel) {
			listHTML = '';
			for (i=0; i<streams.length; i++) {
				listHTML += '<li><a href="' + streams[i].stream + '">' + streams[i].title + '</a> ' + streams[i].description + '</li>';
			}
	
			$(streamSel).html(listHTML);
	
			$(streamSel + ' li a').on('click',function(e) {
				selectedStream = streams[$(this).parent().index()];
				newStream = {};
				newStream.title = $(this).html();
				if (selectedStream.format == 'm4a') {
					newStream.m4a = selectedStream.stream;
				} else if (selectedStream.format == 'mp3') {
					newStream.mp3 = selectedStream.stream;
				}
				newStream.siteurl = selectedStream.siteurl;
				playStream(newStream);
				$(this).blur();
				return false;
			});
	
			if (streams.length == 1) {
				setCurrentStream(stream);
			}
		}
		
		/**
		 * Saves the current stream in the self.options
		 * @param stream the stream that is currently being handled
		 * @returns void
		 */
		function setCurrentStream(stream) {
			self.options.currentStream = stream;
		}

// METADATA
		/**
		 * Loads the current metadata from the stream and updates title and station data
		 * @returns void
		 */
		function loadMetadata() {
			if (!self.options.metadataStreamEnabled || !self.options.currentStream) {
				return;
			}
			$.ajax({
				dataType: "json",
				url: self.config.metadataRemoteService,
				data: {
					l: self.options.currentStream.mp3
				},
				success: function(data) {
					if (data.success == 'true') {
						if (data.metadata.streamtitle) {
							setTitle(data.metadata.streamtitle);
						} else {
							setTitle();
						}
						if (data.metadata.station) {
							if (data.metadata.stationurl) {
								setStation("<a href=" + data.metadata.stationurl + " target=\"_blank\">" + data.metadata.station + '</a>');								
							} else {
								setStation(data.metadata.station);
							}
						} else {
							setStation();
						}
					} else {
						setTitle('Station data unavailable.');
						setStation();
					}
					// call again after the timeout
					setTimeout(loadMetadata,self.options.metadataCheckInterval*1000);
				},
				error: function(err) {
					setTitle('Station data unavailable.');
					setStation();
				}
			});
		};
		 
		/**
		 * Update playing to a new stream
		 * @param stream the stream to play
		 */
		function playStream(stream) {
			if (typeof(stream) != 'undefined') {
				setCurrentStream(stream);
			}
			if (self.options.currentStream) {
				var jPlayerData = self.$elem.data("jPlayer");
				if (self.options.trackingEnabled && typeof(jPlayerData.status.media.title) != 'undefined') {
					// stopped listening to the last one
					trackEnd(jPlayerData.status.media.title,jPlayerData.status.currentTime);
				}
				self.$elem.jPlayer("setMedia", self.options.currentStream).jPlayer("play");
			}
		}
	
		/**
		 * Updates the title display incorporating either the override display or the stream title.
		 * @param title the title to display (may include HTML)
		 */
		function setTitle(title) {
			var show = false;
			if (self.options.overrideTitle != null) {
				show = true;
				$(self.options.titleSel).html(self.options.overrideTitle);
			} else if (typeof(title) != 'undefined') {
				$(self.options.titleSel).html(title);
				show = true;
			} else {
				$(self.options.titleSel).html('');
			}
			if (show) {
				$(self.options.titleSel).show();
			} else {
				$(self.options.titleSel).hide();
			}
		}
	
		/**
		 * Updates the station display
		 * @param station the station to display (may include HTML)
		 */
		function setStation(station) {
			var show = false;
			if (typeof(station) != 'undefined') {
				$(self.options.stationSel).html(station);
				show = true;
			} else {
				$(self.options.stationSel).html('');
			}
			if (show) {
				$(self.options.stationSel).show();
			} else {
				$(self.options.stationSel).hide();
			}
		}
	
		/**
		 * Clears all metadata
		 */
		function clearMetadata() {
			self.options.currentMedia = null;
			setTitle();
			setStation();
		}
		
// TRACKING & ANALYTICS
		
		function trackPlayer() {
			trackEvent('loaded',getLoadedUrl());
		}
		
		function trackStart(title) {
			trackEvent('start',title);
		}
		
		function trackPause(title,time) {
			trackEvent('pause',title,time);
		}
		
		function trackDuration(title,time) {
			trackEvent('duration',title,time);
		}
		
		function trackEnd(title,time) {
			trackEvent('ended',title,time);
		}
		
		function trackPop(title,time) {
			trackEvent('popped',title,time);
		}
		
		function getLoadedUrl() {
			var url = (window.location != window.parent.location) ? document.referrer: document.location; // URL of calling page regardless of where this was embedded
			return url;
		}
		
		/**
		 * Pulls a title to use for event tracking from a jPlayer event structure
		 * @param event the event that is triggering the tracking
		 */
		function getMediaTitleForTracking(event) {
			if (event != undefined) {
				if (event.jPlayer.status.media.title && event.jPlayer.status.media.title.length > 0) {
					return event.jPlayer.status.media.title;
				} else {
					return event.jPlayer.status.src;
				}
			}
		}
	
		/**
		 * Google Analytics tracking of events
		 * @param type the type of event to track
		 * @param title the name of the event to track
		 * @param value the value of the event to track
		 */
		function trackEvent(type,title,value) {
			if (self.options.embedded) {
				type += '-offsite';
			}
			if (typeof(value) == 'undefined') { 
				console.log("Tracking event " + type + ": " + title);
				_gaq.push(['_trackEvent', 'audio', type, title]);
			} else {
				trackValue = Math.round(value);
				console.log("Tracking event " + type + ": " + title + ' at ' + trackValue);
				_gaq.push(['_trackEvent', 'audio', type, title, trackValue]);
			}
		}
// SHARING & EMBED 		
		/**
		 * Displays the share options panel
		 */
		function displayShareOptions() {
			if (self.options.currentStream) {
				// set the text for the copy area
				$(self.options.shareSel + ' .jp-share-code').val(getCurrentEmbedCode());
				// show the panel
				$(self.options.shareSel).show();
				// select the text for easier copying
				$(self.options.shareSel + ' .jp-share-code').focus(function() {
				    var $this = $(this);
				    $this.select();

				    // Work around Chrome's little problem
				    $this.mouseup(function() {
				        // Prevent further mouseup intervention
				        $this.unbind("mouseup");
				        return false;
				    });
				});
				// hide button
				$(self.options.shareSel + " .share-hide").on("click",function(event) {
					$(this).off("click",false);
					$(self.options.shareSel).hide();
				})
			}
		}
		
		/**
		 * Generates the embed code for the current stream
		 * @param width the width for the player
		 * @param height the height for the player
		 * @returns {String} the iframe embed code
		 */
		function getCurrentEmbedCode(width,height) {
			if (typeof(width) == 'undefined') {
				width = 450;
			}
			if (typeof(width) == 'undefined') {
				height = 400;
			}
			var src = self.config.embedPlayer + '?l=' + self.options.currentStream.mp3;
			var embed = '<iframe width="' + width + '" height="' + height + '" src="' + src + '" frameborder="0"></iframe>';
			return embed;
		}
	} // end BBGPlayer
	
	$.fn.bbgPlayer = function(options) {
		return this.each(function() {
			if (!$(this).data('bbgPlayer')) {
				// prevent multiple instantation
				$(this).data('bbgPlayer',new BBGPlayer(this,options));
			}
		})
	}
	
}(jQuery));
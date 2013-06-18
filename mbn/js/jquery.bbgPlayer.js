/**
 * BBG Audio Streaming Player jQuery plugin
 * Requires jQuery and jPlayer
 * 
 */
;(function($) {

	/**
	 * Creates the BBG Player on an element and returns an instance
	 * 
	 * REQUIRED IN OPTIONS:
	 * Either config or overrideStream must be passed in.  Everything else is optional.
	 * 
	 * playerOpts:				An object of options to be passed directly to JPlayer
	 * bbgCssSelectors: 		An object of CSS selectors for bbg specific customizations
	 * 		title:				The selector to song title display
	 * 		station:			The selector to station display
	 * 		share:				The selector to the share button/link
	 * 		sharePanel:			The selector to the panel to be displayed upon share
	 * 		streams:			The selector to the streams list (this should be on a list tag (ol, ul)
	 * 		pop:				The selector to the pop button/link
	 * 		poster:				The location for artwork
	 * 		loading:			The loading container for showing a loading graphic
	 * 		statusConnecting: 	Shows the status indicator when connecting
	 * 		statusStreaming: 	Shows the status indicator when streaming
	 * 		statusPaused:		Shows the status indicator when paused
	 * 		statusEnded:		Shows the status indicator when ended
	 * labels: 					An object containing labels that are dynamically written out
	 * 		selectStream:		The text to select a stream - only used in top option value when select component used for streams list
	 * trackingEnabled: 		Indicates if analytics tracking is enabled
	 * metadataStreamEnabled: 	Indicates if reading metadata from the audio stream is enabled
	 * metadataCheckInterval: 	How often to check for new metadata if reading from stream (in seconds)
	 * overrideStream: 			An override MP3 stream to be played without passing any config
	 * config:					The configuration id to use for the player.  This is the filename in the config file folder without the xml extension
	 * overrideTitle: 			A title to display throughout the player rather than dynamic song information
	 * embedded: 				Indicates if this is an embedded player offsite
	 * popped: 					Indicates if this is a popped out player
	 * autoPlay: 				Indicates if stream should autoplay on load
	 * streamListComponent: 	The type of component used for stream list (ul or select)
	 * showSiteUrl:				Indicates if url should be included in station listing
	 * showPosters:				Indicates if artwork should be displayed
	 * shareLink:				
	 * social:					An object of options for sharing the player
	 * 		shareLink:			The link to share for a player social components.  This defaults to the current url
	 * 		facebook:			Facebook options
	 * 			enabled:		Indicates if facebook share is enabled
	 * 		twitter:			Twitter options
	 * 			enabled:		Indicates if Twitter sharing is enabled
	 * 		email:				Email options
	 * 			enabled:		Indicates if share by email is enabled
	 * 			subject:		Subject to prepopulate
	 * 			body:			Body to prepopulate (link will be appended after a line break)
	 */
	function BBGPlayer(elem, options) {
		var self = this;
		self.$elem = $(elem);
		
		var STATUS_CONNECTING = 0;
		var STATUS_CONNECTED = 1;
		var STATUS_ENDED = 2;
		var STATUS_PAUSED = 3;
		
		// to allow for console logging for debug - safety feature for IE, etc.
		var console=console||{"log":function(){}};
		
		var defaults = {
			playerOpts: {},
			bbgCssSelectors: {
				title: '.jp-song',
				station: '.jp-station',
				share: '.jp-share',
				sharePanel: '.jp-share-panel',
				streams: '.jp-streams',
				pop: '.jp-pop',
				poster: '.jp-poster',
				loading: '.jp-loading',
				statusConnecting: '.jp-status-connecting',
				statusStreaming: '.jp-status-streaming',
				statusPaused: '.jp-status-paused',
				statusEnded: '.jp-status-ended',
				social: '.jp-social'
			},
			labels: {
				selectStream:  'Select a station:',
			},
			trackingEnabled: false,
			metadataStreamEnabled: false, // true to read dynamic metadata encoded in stream
			metadataCheckInterval: 10, // number of seconds in between checks for changes in metadata
			overrideStream: null,
			config: null, // id of the configuration to use for this player content
			overrideTitle: null, // a title to display instead of dynamic metadata
			embedded: false, // indicates if this is an embedded player (behaves differently)
			popped: false, // indicates if this is a popped out player
			autoplay: true,
			streamListComponent: 'ul', // the type of component used to display streams (if stream listings are used at all)
			showSiteUrl: false, // shows a site url from the configuration file in the station name
			showPosters: true, // shows the poster image for a channel when provided
			social: { // true or false for each social sharing option
				shareLink: 'http://www.voanews.com', // the link to share in social media outlets
				facebook: {
					enabled: true
				},
				twitter: {
					enabled: true
				},
				email: {
					enabled: true,
					subject: 'Live Radio',
					body: 'I wanted to share this online radio station with you.'
				}
			}
		}
		self.options = $.extend(true,{},defaults,options);
		
		self.config = {
			embedPlayer: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/mbn/embed.php',
			popoutPlayer: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/mbn/radiosawa.php',
			metadataRemoteService: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/metadata/remote.streaminfo.php', //url to remote file that reads metadata - should be on same domain as it uses json
			configFolder: 'http://ec2-174-129-178-122.compute-1.amazonaws.com/ovap/LSAP/mbn/config/',
			trackIncrement: 30, // number of seconds in between duration tracking calls
			trackEventCategory: 'Live Audio Streaming Player'
		}
		
		self.currentStream = null;
		
		init();
	
		function init() {
			var ready = false;
			var nextTrackTime = self.config.trackIncrement;
			
			// if there is an override stream, set it to the current stream so that it plays upon startup
			if (self.options.overrideStream) {
				setCurrentStream(self.options.overrideStream);
			}
			
			// initialize player
			self.$elem.jPlayer({
				ready: function (event) {
					initializeBbgCustom(event.jPlayer);
					showStatus();
					ready = true;
					if (self.options.autoplay) {
						playStream();
					} else if (self.options.overrideStream) {
						$(this).jPlayer("setMedia", self.currentStream);
					}
					trackPlayer();
				},
				play: function(event) {
					showLoading(false);
					showStatus(STATUS_CONNECTED);
					nextTrackTime = self.config.trackIncrement; // reset the tracking time
					// has been an the specified amount since the last log so log it for duration purposes
					trackStart(getMediaTitleForTracking(event));

					// set initial metadata from overall station info provided by client
					if (self.currentStream.siteurl && self.options.showSiteUrl) {
						setStation('<a href="' + self.currentStream.siteurl + '">' + self.currentStream.title + '</a>');
					} else if (self.currentStream.title) {
						setStation(self.currentStream.title);
					} else {
						setStation();
					}
					// load dynamic metadata from stream if enabled
					if (self.options.metadataStreamEnabled) {
						loadMetadata();
					}
				},
				ended: function(event) {
					showStatus(STATUS_ENDED);
					trackEnd(getMediaTitleForTracking(event),event.jPlayer.status.currentTime);
					clearMetadata();
					
					setPoster();
				},
				pause: function(event) {
					showStatus(STATUS_PAUSED);
					// pause gets called when switching streams in which case this is not set....
					var trackTitle = getMediaTitleForTracking(event);
					if (trackTitle.length > 0) {
						// can be zero when we switch tracks - this event gets called in between ending and starting the next channel
						trackPause(getMediaTitleForTracking(event),event.jPlayer.status.currentTime);
					}
					self.$elem.jPlayer("clearMedia");
				},
				timeupdate: function(event) {
					if (event.jPlayer.status.currentTime > 0 && event.jPlayer.status.currentTime > nextTrackTime) {
						// has been an the specified amount since the last log so log it for duration purposes
						trackDuration(getMediaTitleForTracking(event),self.config.trackIncrement);
						nextTrackTime += self.config.trackIncrement;
					}
				},
				error: function(event) {
					var getFlashUrl = 'http://get.adobe.com/flashplayer';
					if(ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
						// Setup the media stream again and play it.
						playStream(self.currentStream);
					} 
				},
				solution: "flash,html",
				swfPath: "/ovap/LSAP/mbn/js",
				supplied: 'mp3',
				preload: "none",
				wmode: "window",
				keyEnabled: true,
				warningAlerts: false,
				errorAlerts: false
		    }); // end jPlayer definition
			
			// additional jPlayer options
			if (typeof(self.options.playerOpts) != 'undefined') {
				for (var optName in self.options.playerOpts) {
					self.$elem.jPlayer( "option", optName, self.options.playerOpts[optName]);
				}
			}
			
		} // end init
		
		/**
		 * Initializes references to the overriding BBG css values and custom behaviors
		 * Must be called after player is initialized
		 */
		function initializeBbgCustom(jPlayerData) {
			self.bbgCss = {
				css: {},
				jq: {}
			};
			var ancestor = jPlayerData.options.cssSelectorAncestor;
			
			self.bbgCss.css.ancestor = ancestor;
			self.bbgCss.jq.ancestor = $(ancestor);
			for (var type in self.options.bbgCssSelectors) {
				var sel = ancestor + ' ' + self.options.bbgCssSelectors[type];
				self.bbgCss.css[type] = sel
				self.bbgCss.jq[type] = $(sel);
			}
			
			// handle stream config loading
			if (self.options.config != null) {
				generateStreamsFromConfiguration();
			}
			
			// set up sharing
			if (self.bbgCss.jq.share && self.bbgCss.jq.share.length > 0 
					&& self.bbgCss.jq.sharePanel && self.bbgCss.jq.sharePanel.length > 0) {
				self.bbgCss.jq.share.on('click',function(e) {
					displayShareOptions();
				});
				self.bbgCss.jq.sharePanel.hide();
				self.bbgCss.jq.share.show();
			}
			generateSocialBar();
			
			// set out pop out function
			if (!self.options.popped && self.bbgCss.jq.pop && self.bbgCss.jq.pop.length > 0) {
				self.bbgCss.jq.pop.on("click",function(e) {
					trackPop()
					window.open(self.config.popoutPlayer + '?' + getPlayerQueryString(),
						'BBGPlayer',
						'width=600,height=400,left=150,top=150,location=no,menubar=no,toolbar=no');
					self.$elem.jPlayer("pause");
				})
			}
			
		}
		
// STREAM LISTS & SWITCHING
		/**
		 * Generates the stream data from an external url
		 */
		function generateStreamsFromConfiguration() {
			var configUrl = self.config.configFolder + self.options.config + '.xml';
			$.ajax({
				url: configUrl,
				success: function(xml) {
					var streams = new Array();
					$(xml).find("item").each(function(i){
						streams.push({
							id: $(this).attr('channelid'),
							title: $(this).find("title").text(),
							titleImage: $(this).find("titleImage").text(),
							titleImageHover: $(this).find("titleImageHover").text(),
							titleImageSelect: $(this).find("titleImageSelect").text(),
							stream: $(this).find("streamUrl").text(),
							format: $(this).attr("format"),
							type: $(this).attr("streamtype"),
							description: $(this).find("description").text(),
							siteurl: $(this).find("siteUrl").text(),
							poster: $(this).find("poster").text()
						});
					});
					if (streams.length === 1) {
						// just play a single stream and don't show a list
						playStream(createMediaObject(streams[0]));
					} else if (streams.length > 1) {
						displayStreamList(streams,0);
						clearMetadata();
						playStream(createMediaObject(streams[0]),true);
					}
				},
				dataType: 'xml'
			});
		}
		
		/**
		 * Displays the stream list from configuration streaming data
		 * @param streams the streaming data (see generateStreamsFromConfiguration)
		 * @param selectedIndex the index within the stream to show as selected
		 */
		function displayStreamList(streams,selectedIndex) {
			if (self.options.streamListComponent == 'ul') {
				displayStreamUnorderedList(streams,selectedIndex);
			} else if (self.options.streamListComponent == 'select') {
				displayStreamSelectList(streams,selectedIndex);
			}
		}
		
		function displayStreamSelectList(streams,selectedIndex) {
			var listHtml = '';
			var num = streams.length;
			var streamListOffset = 0;
			if (self.options.labels.selectStream && self.options.labels.selectStream.length > 0) {
				streamListOffset = 1;
				listHtml += '<option value="">' + self.options.labels.selectStream + '</option>';
			}
			for (var i=0; i<num; i++) {
				listHtml += '<option value="' + streams[i].stream + '">' + streams[i].title + '</option>';
			}
			self.bbgCss.jq.streams.html(listHtml);
			
			self.bbgCss.jq.streams.on('change',function(e) {
				if (this.selectedIndex < streamListOffset) {
					return;
				}
				var selectedStreamIndex = this.selectedIndex - streamListOffset;
				playStream(createMediaObject(streams[selectedStreamIndex]));
				if (streamListOffset > 0) {
					this.selectedIndex = 0; // put it back to the select option
				}
			});
		}
		
		function displayStreamUnorderedList(streams,selectedIndex) {
			var listHtml = '';
			var num = streams.length;
			var css = '<style>';
			for (var i=0; i<num; i++) {
				var cls = streams[i].id;
				if (streams[i].titleImage) {
					var cls = streams[i].id;
					if (selectedIndex === i) {
						cls += ' selected';
					}
					listHtml += '<li><a href="' + streams[i].stream + '" class="' + cls + ' titleImage" title="' + streams[i].title + '"></a>';
					css += '.' + streams[i].id + " { background-image:url('" + streams[i].titleImage + "');}";
					if (streams[i].titleImageHover) {
						css += '.' + streams[i].id + ":hover {background-image:url('" + streams[i].titleImageHover + "');}";
						$('<img/>')[0].src = streams[i].titleImageHover; // preload image
					}
					if (streams[i].titleImageSelect) {
						css += '.' + streams[i].id + ".selected {background-image:url('" + streams[i].titleImageSelect + "');}";
					}
				} else {
					listHtml += '<li><a href="' + streams[i].stream + '">' + streams[i].title + '</a>';
				}
				if (streams[i].description) {
					listHtml += streams[i].description;
				}
				listHtml += '</li>';
			}
			css += '</style>';
			$('head').append(css);
			self.bbgCss.jq.streams.html(listHtml);
	
			$(self.bbgCss.css.streams + ' li a').on('click',function(e) {
				selectedStream = streams[$(this).parent().index()];
				playStream(createMediaObject(selectedStream));
				$(self.bbgCss.css.streams + ' li a').removeClass('selected'); // clear selected values
				$(this).addClass('selected'); // mark the current as selected
				$(this).blur();
				return false;
			});
		}
		
		/**
		 * Creates a media object in the format for jPlayer from the data loaded from the configuration for a stream.
		 * @param streamData an object created from configuration stream data
		 * @returns an object ready to be passed to jPlayer setMedia method.
		 */
		function createMediaObject(streamData) {
			var newStream = {};
			newStream.title = streamData.title;
			if (streamData.format == 'm4a') {
				newStream.m4a = streamData.stream;
			} else if (streamData.format == 'mp3') {
				newStream.mp3 = streamData.stream;
			}
			if (streamData.description) {
				newStream.description = streamData.description;
			}
			if (self.options.showPosters && streamData.poster) {
				newStream.poster = streamData.poster;
			}
			newStream.siteurl = streamData.siteurl;
			return newStream;
		} 
		
		/**
		 * Saves the current stream in the self.options
		 * @param stream the stream that is currently being handled
		 * @returns void
		 */
		function setCurrentStream(stream) {
			self.currentStream = stream;
		}

// METADATA
		/**
		 * Loads the current metadata from the stream and updates title and station data
		 * @returns void
		 */
		function loadMetadata() {
			if (!self.options.metadataStreamEnabled || !self.currentStream) {
				return;
			}
			$.ajax({
				dataType: "json",
				url: self.config.metadataRemoteService,
				data: {
					l: self.currentStream.mp3
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
		 * @param cueonly boolean if true then the stream is only readied to play, if false then it is played too
		 */
		function playStream(stream,cueonly) {
			if (typeof(stream) != 'undefined') {
				setCurrentStream(stream);
			}
			if (typeof(cueonly) == 'undefined') {
				cueonly = false;
			}
			if (self.currentStream) {
				var jPlayerData = self.$elem.data("jPlayer");
				if (typeof(jPlayerData.status.media.title) != 'undefined') {
					// stopped listening to the last one
					trackEnd(jPlayerData.status.media.title,jPlayerData.status.currentTime);
				}
				self.$elem.jPlayer("setMedia", self.currentStream)
				if (self.currentStream.poster) {
					setPoster(self.currentStream.poster);
				}
				if (!self.options.metadataStreamEnabled) {
					setStation(self.currentStream.title);
				}
				if (!cueonly) {
					showStatus(STATUS_CONNECTING);
					showLoading(true);
					self.$elem.jPlayer("play");
				}
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
				self.bbgCss.jq.title.html(self.options.overrideTitle);
			} else if (typeof(title) != 'undefined') {
				self.bbgCss.jq.title.html(title);
				show = true;
			} else {
				self.bbgCss.jq.title.html('');
			}
			if (show) {
				self.bbgCss.jq.title.show();
			} else {
				self.bbgCss.jq.title.hide();
			}
		}
	
		/**
		 * Updates the station display
		 * @param station the station to display (may include HTML)
		 */
		function setStation(station) {
			var show = false;
			if (typeof(station) != 'undefined') {
				self.bbgCss.jq.station.html(station);
				show = true;
			} else {
				self.bbgCss.jq.station.html('');
			}
			if (show) {
				self.bbgCss.jq.station.show();
			} else {
				self.bbgCss.jq.station.hide();
			}
		}
		
		/**
		 * Updates the poster displayed.
		 * Note: this is outside of jPlayer's poster functionality because
		 * the poster will be automatically removed upon pause.
		 */
		function setPoster(poster) {
			if (poster && poster.length > 0) {
				self.bbgCss.jq.poster.html('<img src="' + poster + '" />');
			} else {
				self.bbgCss.jq.poster.html('');
			}
		}
		
		/**
		 * Shows the loading animation
		 * @param boolean loading true if loading, false if not
		 */
		function showLoading(loading) {
			if (loading) {
				self.bbgCss.jq.loading.show();
			} else {
				self.bbgCss.jq.loading.hide();
			}
		}
		
		/**
		 * Shows status indicator change
		 * @param status the status to show (one of constants STATUS_CONNECTING, STATUS_CONNECTED, STATUS_ENDED)
		 */
		function showStatus(status) {
			if (status === STATUS_CONNECTING) {
				self.bbgCss.jq.statusConnecting.show();
				self.bbgCss.jq.statusStreaming.hide();
				self.bbgCss.jq.statusPaused.hide();
				self.bbgCss.jq.statusEnded.hide();
			} else if (status === STATUS_CONNECTED) {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.show();
				self.bbgCss.jq.statusPaused.hide();
				self.bbgCss.jq.statusEnded.hide();
			} else if (status === STATUS_ENDED) {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.hide();
				self.bbgCss.jq.statusPaused.hide();
				self.bbgCss.jq.statusEnded.show();
			} else if (status === STATUS_PAUSED) {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.hide();
				self.bbgCss.jq.statusPaused.show();
				self.bbgCss.jq.statusEnded.hide();
			} else {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.hide();
				self.bbgCss.jq.statusPaused.hide();
				self.bbgCss.jq.statusEnded.hide();
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
			trackEvent('load',getLoadedUrl());
		}
		
		function trackStart(title) {
			trackEvent('start',title);
		}
		
		function trackPause(title,time) {
			trackEvent('pause',title);
		}
		
		function trackDuration(title,time) {
			trackEvent('duration',title,time);
		}
		
		function trackEnd(title,time) {
			trackEvent('end',title);
		}
		
		function trackPop(title,time) {
			trackEvent('pop',title,time);
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
			if (!self.options.trackingEnabled) {
				return;
			} 
			if (self.options.embedded) {
				type += '-offsite';
			}
			if (typeof(value) == 'undefined') { 
				console.log("Tracking event " + type + ": " + title);
				_gaq.push(['_trackEvent', self.config.trackEventCategory, type, title]);
			} else {
				trackValue = Math.round(value);
				console.log("Tracking event " + type + ": " + title + ' at ' + trackValue);
				_gaq.push(['_trackEvent', self.config.trackEventCategory, type, title, trackValue]);
			}
		}
// SHARING & EMBED
		/**
		 * Returns the code to embed a Facebook Like Button
		 */
		function getFacebookCode() {
			var code = '';
			code = '<iframe src="//www.facebook.com/plugins/like.php?';
			code += 'href=' + encodeURIComponent(self.options.social.shareLink);
			code += '&amp;send=false&amp;layout=button_count&amp;width=90&amp;show_faces=false&amp;font&amp;colorscheme=light&amp;action=like&amp;height=21&amp;appId=120601048025688" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:90px; height:21px;" class="socialframe" allowTransparency="true"></iframe>';
			return code;
		}

		/**
		 * Returns the code to embed a Twitter Share Button
		 */
		function getTwitterCode() {
			var code = '<a href="https://twitter.com/share" class="twitter-share-button socialframe" data-url="' + self.options.social.shareLink + '">Tweet</a>';
			return code;
		}
		
		function getEmailCode() {
			var code = '<a class="jp-email-share" target="_blank" href="mailto:?subject=' + self.options.social.email.subject + '&body=' + self.options.social.email.body + '%0A%0A' + self.options.social.shareLink + '">Email</a>';
			return code;
		}
		
		/**
		 * Generates the social media bar of options
		 */
		function generateSocialBar() {
			if (self.options.social.email.enabled === true) {
				self.bbgCss.jq.social.append(getEmailCode());
			}
			if (self.options.social.facebook.enabled === true) {
				self.bbgCss.jq.social.append(getFacebookCode());
			}
			if (self.options.social.twitter.enabled === true) {
				self.bbgCss.jq.social.append(getTwitterCode());
				!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
			}
		}
		
		/**
		 * Displays the share options panel
		 */
		function displayShareOptions() {
			// set the text for the copy area
			$(self.bbgCss.css.sharePanel + ' .jp-share-code').val(getCurrentEmbedCode());
			// show the panel
			self.bbgCss.jq.sharePanel.show();
			// select the text for easier copying
			$(self.bbgCss.css.sharePanel + ' .jp-share-code').focus(function() {
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
			$(self.bbgCss.css.sharePanel + " .share-hide").on("click",function(event) {
				$(this).off("click",false);
				self.bbgCss.jq.sharePanel.hide();
			})
		}
		
		/**
		 * Generates the query string to be passed to any pop-outs or shares of the current player
		 * @returns the string to appeand to the main url
		 */
		function getPlayerQueryString() {
			var qs = '';
			if (self.options.overrideStream) {
				qs += '&l=' + self.currentStream.mp3;
			}
			if (self.options.config) {
				qs += '&c=' + self.options.config;
			}
			return qs;
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
			if (typeof(height) == 'undefined') {
				height = 400;
			}
			var src = self.config.embedPlayer + '?' + getPlayerQueryString();
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
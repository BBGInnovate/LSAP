/**
 * BBG Audio Streaming Player jQuery plugin
 * Requires jQuery and jPlayer
 * Also is passed a configuration module with base paths and constants defined.
 */

;define(['jquery.bbgPlayer.config','jquery','jquery.jplayer.min'], function(bbgPlayerConfig) {

	/**
	 * Creates the BBG Player on an element and returns an instance
	 * 
	 * REQUIRED IN OPTIONS:
	 * Either config or overrideStream must be passed in.  Everything else is optional.
	 *
	 * overrideStream: 			An override MP3 stream to be played without passing any config
	 * config:					The configuration id to use for the player.  This is the filename in the config file folder without the xml extension
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
	 *		statusNotStarted:	Shows the status indicator that is shown until play is initiated the first time
	 * 		social:				The social media connect menu area for options to be written
	 * 		share:				The social media share area for options to be written
	 * 		brandingLink:		The a tag to populate with branding link
	 * 		footer:				The footer content area
	 * 		menu:				A configured menu list element (used for mobile sites only)
	 *		location:   		The selector to output station location info
	 * embedded: 				Indicates if this is an embedded player offsite
	 * popped: 					Indicates if this is a popped out player
	 * 
	 * The following options can be passed from an external configuration file
	 * labels: 					An object containing labels that are dynamically written out
	 * 		selectStream:		The text to select a stream - only used in top option value when select component used for streams list
	 * locale:					The locale code to use for localization: used by Facebook like script
	 * trackingEnabled: 		Indicates if analytics tracking is enabled
	 * GAID:					Google Analytics tracking account id
	 * metadataStreamEnabled: 	Indicates if reading metadata from the audio stream is enabled
	 * metadataCheckInterval: 	How often to check for new metadata if reading from stream (in seconds)
	 * overrideTitle: 			A title to display throughout the player rather than dynamic song information
	 * autoplay: 				Indicates if stream should autoplay on load
	 * showSiteUrl:				Indicates if url should be included in station listing
	 * showPosters:				Indicates if artwork should be displayed
	 * social: 					An object of options for the social menu connect menu
	 *		facebookUrl: 		URL to station's facebook page
	 *		twitterHandle: 		Twitter username
	 * 		googlePlusUrl: 		Google Plus URL
	 *		websiteUrl: 		URL to station's website   
	 * share:					An object of options for sharing the player
	 * 		shareLink:			The link to share for a player social components.  This defaults to the current url
	 * 		facebook:			Facebook options
	 * 			enabled:		Indicates if facebook share is enabled
	 * 		twitter:			Twitter options
	 * 			enabled:		Indicates if Twitter sharing is enabled
	 * 		email:				Email options
	 * 			enabled:		Indicates if share by email is enabled
	 * 			subject:		Subject to prepopulate
	 * 			body:			Body to prepopulate (link will be appended after a line break)
	 *		embed:				Embed code options
	 *			enabled:		Indicates if share by embed is enabled
	 *			instructions:	Text to display for embed options instructions
	 *			hide:			label for the hide button
	 * location:   				Station geographic location info
	 *		city:    			Station City
	 *		country:     		Station Country
	 * 		location: 			user defined location string
	 * brandingLink:			URL to indicate the brandingLink anchor tag
	 * footerContent:			Any HTML content to be displayed within the footer
	 */
	function BBGPlayer(elem, options) {
		var jplayerReady = false; // true when jPlayer is instantiated and ready
		var self = this;
		self.$elem = $(elem);
	
		var STATUS_PENDING = 0;
		var STATUS_CONNECTING = 1;
		var STATUS_CONNECTED = 2;
		var STATUS_ENDED = 3;
		var STATUS_PAUSED = 4;
		
		// to allow for console logging for debug - safety feature for IE, etc.
		//var console=console||{"log":function(){}};
		
		// holds configuration stream data until ready to display
		var configStreamsXml;
		// likewise - holds menu stream data until ready to display
		var configMenuXml;
		
		// plugin default values
		var defaults = {
			playerOpts: {},
			bbgCssSelectors: {
				title: '.jp-song',
				streamTitle: '.jp-stream-title',
				station: '.jp-station',
				category: '.jp-category',
				callLetters: '.jp-call-letters',
				streams: '.jp-streams',
				pop: '.jp-pop',
				poster: '.jp-poster',
				loading: '.jp-loading',
				statusConnecting: '.jp-status-connecting',
				statusStreaming: '.jp-status-streaming',
				statusPaused: '.jp-status-paused',
				statusEnded: '.jp-status-ended',
				statusNotStarted: '.jp-status-not-started',
				share: '.jp-share ul',
				sharePanel: '.jp-share-panel',
				social: '.jp-social',
				location: '.jp-location',
				brandingLink: '.player-branding a',
				footer: '#footer',
				menu: '#menu ul.nav'
			},
			labels: {
				selectStream:  'Select a station:',
			},
			locale: 'en_US',
			trackingEnabled: false,
			GAID: 'UA-25348602-1',
			metadataStreamEnabled: false, // true to read dynamic metadata encoded in stream
			metadataCheckInterval: 10, // number of seconds in between checks for changes in metadata
			overrideStream: null,
			config: null, // id of the configuration to use for this player content
			overrideTitle: null, // a title to display instead of dynamic metadata
			embedded: false, // indicates if this is an embedded player (behaves differently)
			popped: false, // indicates if this is a popped out player
			autoplay: true,
			showSiteUrl: false, // shows a site url from the configuration file in the station name
			showPosters: true, // shows the poster image for a channel when provided
			social: {
				facebookUrl: null,
				twitterHandle: null,
				googlePlusUrl: null,
				websiteUrl: null
			},
			share: { // true or false for each sharing option
				shareLink: getLoadedUrl(), // the link to share in social media outlets
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
				},
				embed: {
					enabled: true,
					instructions: 'Copy the following to embed the player:',
					hide: 'Hide'
				}
			},
			location: {
				city: null,
				country: null,
				local: null
			},
			brandingLink: null, // the link to show in the header branding
			footerContent: '<p>A BBG Player</p>' // the HTML to display within the footer
		}
		self.options = $.extend(true,{},defaults,options);
		self.config = bbgPlayerConfig;
		
		self.currentStream = null;
		
		init();
	
		/**
		 * Initializes the BBG Player instance
		 */
		function init() {
			// if there is an override stream, set it to the current stream so that it plays upon startup
			if (self.options.overrideStream) {
				setCurrentStream(self.options.overrideStream);
			}
			if (self.options.config && self.options.config.length > 0) {
				loadConfiguration();
			} else {
				initializePlayer();
			}
		} 
		
		/**
		 * Loads the configuration from file and handles
		 */
		function loadConfiguration() {
			var configUrl = self.config.configFolder + self.options.config + '.xml';
			$.ajax({
				url: configUrl,
				dataType: 'xml',
				success: function(xml) {
					configMenuXml = $(xml).find("menu");
					parseStyles($(xml).find("styles"));
					parseConfig($(xml).find("config"));
					configStreamsXml = $(xml).find('streams');
					initializeTracking();
					initializePlayer();
				}
			});
		}
		
		/**
		 * Sets up Google Analytics tracking if configured
		 */
		function initializeTracking() {
			if (self.options.trackingEnabled && self.options.GAID.length > 0) {
				// initialize Google Analytics Tracking Code
				var _gaq = _gaq || [];
				_gaq.push(['_setAccount', self.options.GAID]);
				_gaq.push(['_trackPageview']);
				
				(function() {
				  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
				})();
			}
		}
		
		/**
		 * Sets up the jPlayer instance including all handlers
		 */
		function initializePlayer() {
			var nextTrackTime = self.config.trackIncrement;
		
			// initialize player
			self.$elem.jPlayer({
				ready: function (event) {
					initializeBbgCustom(event.jPlayer);
					jplayerReady = true;
					if (self.options.autoplay) {
						playStream();
					} else if (self.currentStream) {
						$(this).jPlayer("setMedia", self.currentStream);
						loadMetadata(true);
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
					if (self.currentStream.title) {
						setStation(self.currentStream.title,self.currentStream.siteurl);
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
					if(jplayerReady && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
						// Setup the media stream again and play it.
						playStream(self.currentStream);
					} 
				},
				solution: "flash,html",
				swfPath: self.config.jplayerSwfLocation,
				supplied: 'mp3',
				preload: "none",
				wmode: "window",
				cssSelectorAncestor: self.options.playerOpts.cssSelectorAncestor ? self.options.playerOpts.cssSelectorAncestor : '#jp_container_1',
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
		}
		
		/**
		 * Initializes references to the overriding BBG css values and custom behaviors and any customized behavior that is dependent
		 * upon these.
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
			
			// generate any menu items
			if (configMenuXml) {
				parseMenu(configMenuXml);
			}
			
			// update status
			showStatus(STATUS_PENDING);
			
			// write in any branding
			if (self.options.brandingLink && self.options.brandingLink.length > 0) {
				self.bbgCss.jq.brandingLink.attr('href',self.options.brandingLink).attr('target','bbgPlayer');
			}

			// write in any stream listings
			if (configStreamsXml) {
				parseStreams(configStreamsXml);
			}
			
			// write in any footer content
			if (self.options.footerContent && self.options.footerContent.length > 0) {
				self.bbgCss.jq.footer.html(self.options.footerContent);
			}

			//output the Station category
			if (self.options.category !== undefined && self.options.category.length > 0) {
				setCategory(self.options.category);
			}

			//output the Stream Title 
			if (self.currentStream.title !== undefined && self.currentStream.title.length > 0) {
				setStreamTitle(self.currentStream.title);
			}

			//output the Station Call Letters
			if (self.currentStream.callLetters !== undefined) {
				setCallLetters(self.currentStream.callLetters);
			}

			//output the Station Location
			if (self.options.location !== undefined) {
				setLocation(self.options.location);
			}
			
			// set up social media and sharing
			generateShareBar();
			//populate the social media menu
			generateSocialMediaMenu();
			
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
		
		/**
		 * Parses the configuration items from the main player configuration xml
		 * @param xml the jQuery XML document that contains the configuration items
		 */
		function parseConfig(xml) { 
			xml.children().each(function(i) {
				setConfigOption($(this),self.options);
			});
			// now that the configuration is set up jPlayer instance can be created
			initializePlayer();
		}
		
		/**
		 * Sets a property on the configuration object. 
		 * Meant to be called recursively for nested properties.
		 * 
		 * @param item the jQuery xml document for the item to set
		 * @param itemParent the config parent to set the value on
		 */
		function setConfigOption(item,itemParent) {
			if (item.children().length > 0) {
				var newParent = itemParent[item.prop("nodeName")]; 
				item.children().each(function(i) {
					setConfigOption($(this),newParent);
				});
			} else {
				var value = item.text();
				if (value.toLowerCase() === 'true') {
					value = true;
				} else if (value.toLowerCase() === 'false') {
					value = false;
				}
				itemParent[item.prop("nodeName")] = value;
			}
		}
		
		/**
		 * Parses the stylesheet information out of the player configuration file
		 * @param xml the jQuery xml document for the styles
		 */
		function parseStyles(xml) {
			var styleUrl = '';
			xml.find("stylesheet").each(function(i) {
				styleUrl = self.config.styleFolder + $(this).text();
				$('head').append('<link rel="stylesheet" href="' + styleUrl + '">');
			});
		}
		
		/**
		 * Parses out a dynamic menu and renders it
		 * @param xml the jQuery xml document for menu items
		 */
		function parseMenu(xml) {
			var menuHtml = '';
			xml.find('option').each(function(i) {
				menuHtml += '<li><a data-toggle="tab" href="' + $(this).attr('href') + '">' + $(this).text() + '</a></li>';
			});
			self.bbgCss.jq.menu.append(menuHtml);
		}
				
// STREAM LISTS & SWITCHING
		/**
		 * Generates the stream data from loaded stream XML
		 * @param the xml loaded from a configuration file
		 */
		function parseStreams(xml) {
			var streams = new Array();
			var stream = null;
			$(xml).find("item").each(function(i){
				stream = {
					id: $(this).attr('channelid'),
					title: $(this).find("title").text(),
					titleImage: $(this).find("titleImage").text(),
					titleImageHover: $(this).find("titleImageHover").text(),
					titleImageSelect: $(this).find("titleImageSelect").text(),
					formats: [],
					type: $(this).attr("streamtype"),
					description: $(this).find("description").text(),
					callLetters: $(this).find("callLetters").text(),
					siteurl: $(this).find("siteUrl").text(),
					poster: $(this).find("poster").text()
				};
				$(this).find("streamUrl").each(function(k) {
					stream.formats.push({
						format: $(this).attr('format'),
						url: $(this).text()
					});
					$('.jp-no-solution').html( '<a href="' + $(this).text() + '" >' +  $(this).text() + '</a>' );
				});
				streams.push(stream);
			});
			if (streams.length === 1) {
				// just play a single stream and don't show a list
				playStream(createMediaObject(streams[0]));
			} else if (streams.length > 1) {
				displayStreamList(streams,0);
				clearMetadata();
				playStream(createMediaObject(streams[0]),true);
			}
		}
		
		/**
		 * Displays the stream list from configuration streaming data
		 * @param streams the streaming data (see generateStreamsFromConfiguration)
		 * @param selectedIndex the index within the stream to show as selected
		 */
		function displayStreamList(streams,selectedIndex) {
			if (self.bbgCss.jq.streams.is("ul")) {
				displayStreamUnorderedList(streams,selectedIndex);
			} else if (self.bbgCss.jq.streams.is("select")) {
				displayStreamSelectList(streams,selectedIndex);
			}
		}
		
		/**
		 * Displays the stream list in a select component
		 * @param streams the array of stream data
		 * @param selectedIndex the index that should be selected to start
		 */
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

		/**
		 * Displays the stream list in an unordered list
		 * @param streams the array of stream data
		 * @param selectedIndex the index that should be selected to start
		 */
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
			var num = streamData.formats.length;
			newStream.title = streamData.title;
			for (var i=0; i<num; i++) {
				newStream[streamData.formats[i].format] = streamData.formats[i].url;
			}
			if (streamData.description) {
				newStream.description = streamData.description;
			}
			if (streamData.callLetters) {
				newStream.callLetters = streamData.callLetters;
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
		 * @param single boolean to indicate if data should only be pulled once (true) or continually pulled (false)
		 * @returns void
		 */
		function loadMetadata(single) {
			if (!self.options.metadataStreamEnabled || !self.currentStream) {
				return;
			}
			if (single == undefined) {
				single = false;
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
					        var splitTitle = data.metadata.streamtitle.split('-'),
					            returnTitle;
					        splitTitle.forEach(function (val, idx) {
					            if (idx === 0) {
					                returnTitle = val + '<br />';
					            } else if (idx > 0 && idx !== splitTitle.length - 1) {
					                returnTitle += val + '<br />';
					            } else {
					                returnTitle += val;
					            }
					        });
							setTitle(returnTitle);
						} else {
							setTitle();
						}
						if (data.metadata.station) {
							setStation(data.metadata.station,data.metadata.stationurl);
						} else {
							setStation();
						}
					} else {
						setTitle('Station data unavailable.');
						setStation();
					}
					if (!single) {
						// call again after the timeout
						setTimeout(loadMetadata,self.options.metadataCheckInterval*1000);
					}
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
			if (jplayerReady && self.currentStream) {
				var jPlayerData = self.$elem.data("jPlayer");
				if (typeof(jPlayerData.status.media.title) != 'undefined') {
					// stopped listening to the last one
					trackEnd(jPlayerData.status.media.title,jPlayerData.status.currentTime);
				}
				self.$elem.jPlayer("setMedia", self.currentStream);
				if (!cueonly) {
					showStatus(STATUS_CONNECTING);
					showLoading(true);
					self.$elem.jPlayer("play");
				}
			}
			// whether jplayer is initialized or not - go ahead and show the metadata in the meantime
			if (self.currentStream) {
				if (self.currentStream.poster) {
					setPoster(self.currentStream.poster);
				}
				setStation(self.currentStream.title,self.currentStream.siteurl);
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
		 * @param url the url to the station website
		 */
		function setStation(station,url) {
			var show = false;
			if (typeof(station) != 'undefined') {
				if (self.options.showSiteUrl && url != 'undefined') {
					self.bbgCss.jq.station.html('<a href="' + url + '">' + station + '</a>');
				} else {
					self.bbgCss.jq.station.html(station);
				}
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
		 * Updates the category display
		 * @param category string (category text)
		 */
		function setCategory(category) {
			var textElem = $('<span>' + category + '</span>');
			$(textElem).appendTo(self.bbgCss.jq.category);
		}

		/**
		 * Updates the station name 
		 * @param category string (station name text)
		 */
		function setStreamTitle(text) {
			self.bbgCss.jq.streamTitle.text(text);
		}

		/**
		 * Updates the station call letters 
		 * @param text string (station call letters text)
		 */
		function setCallLetters(text) {
			self.bbgCss.jq.callLetters.text(text);
		}

		/**
		 * Updates the Location display
		 * @param location object with location properties (city,country,local)
		 */
		function setLocation(location) {
			if(location.city !== undefined && location.city.length > 0){
				$('<span>' + location.city + '</span>').appendTo(self.bbgCss.jq.location.find('div.city'));
			}
			if(location.country !== undefined && location.country.length > 0){
				$('<span>' + location.country + '</span>').appendTo(self.bbgCss.jq.location.find('div.country'));
			}
			if(location.local !== undefined && location.local.length > 0){
				$('<span>' + location.local + '</span>').appendTo(self.bbgCss.jq.location.find('div.local'));
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
				self.bbgCss.jq.statusNotStarted.hide();
			} else if (status === STATUS_CONNECTED) {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.show();
				self.bbgCss.jq.statusPaused.hide();
				self.bbgCss.jq.statusEnded.hide();
				self.bbgCss.jq.statusNotStarted.hide();
			} else if (status === STATUS_ENDED) {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.hide();
				self.bbgCss.jq.statusPaused.hide();
				self.bbgCss.jq.statusEnded.show();
				self.bbgCss.jq.statusNotStarted.hide();
			} else if (status === STATUS_PAUSED) {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.hide();
				self.bbgCss.jq.statusPaused.show();
				self.bbgCss.jq.statusEnded.hide();
				self.bbgCss.jq.statusNotStarted.hide();
			} else if (status === STATUS_PENDING) {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.hide();
				self.bbgCss.jq.statusPaused.hide();
				self.bbgCss.jq.statusEnded.hide();
				self.bbgCss.jq.statusNotStarted.show();
			} else {
				self.bbgCss.jq.statusConnecting.hide();
				self.bbgCss.jq.statusStreaming.hide();
				self.bbgCss.jq.statusPaused.hide();
				self.bbgCss.jq.statusEnded.hide();
				self.bbgCss.jq.statusNotStarted.hide();
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
			trackEvent('pop',title);
		}
		
		function trackEmail(title) {
			trackEvent('share-email',title);
		}
		
		function trackEmbed(title) {
			trackEvent('share-embed',title);
		}
		
		function trackFacebook(title) {
			trackEvent('share-facebook',title);
		}
		
		function trackTwitter(title) {
			trackEvent('share-twitter',title);
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
			var jdata = '';
			if (event != undefined) {
				jdata = event.jPlayer;
			} else {
				jdata = self.$elem.data("jPlayer");
			}
			if (jdata.status.media.title && jdata.status.media.title.length > 0) {
				return jdata.status.media.title;
			} else {
				return jdata.status.src;
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
				//console.log("Tracking event " + type + ": " + title);
				_gaq.push(['_trackEvent', self.config.trackEventCategory, type, title]);
			} else {
				trackValue = Math.round(value);
				//console.log("Tracking event " + type + ": " + title + ' at ' + trackValue);
				_gaq.push(['_trackEvent', self.config.trackEventCategory, type, title, trackValue]);
			}
		}
// SHARING & EMBED
		/**
		 * Generates the share bar of options
		 */
		function generateShareBar() {
			var jq = null;
			var code = null;
			// twitter
			if (self.options.share.twitter.enabled) {
				code = '<li><a href="https://mobile.twitter.com/compose/tweet?status=' + encodeURI(self.options.share.shareLink) + '" target="_blank" class="jp-twitter-share"><i class="icon-twitter icon-2x"></i></a></li>';
				jq = $(code).appendTo(self.bbgCss.jq.share);
				jq.children("a").on("click",function(e) {
					trackTwitter(getMediaTitleForTracking());
				});
			}
			// facebook
			if (self.options.share.facebook.enabled) {
				code = '<li><a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURI(self.options.share.shareLink) + '" target="_blank" class="jp-facebook-share"><i class="icon-facebook icon-2x"></i></a></li>';
				jq = $(code).appendTo(self.bbgCss.jq.share);
				jq.children("a").on("click",function(e) {
					trackFacebook(getMediaTitleForTracking());
				});
			}
			// email
			if (self.options.share.email.enabled) {
				code = '<a class="jp-email-share" target="_blank" href="mailto:?subject=' + self.options.share.email.subject + '&body=' + self.options.share.email.body + '%0A%0A' + self.options.share.shareLink + '"><i class="icon-envelope icon-2x"></i></a>';
				jq = $('<li>' + code + '</li>').appendTo(self.bbgCss.jq.share);
				jq.children("a").on("click",function(e) {
					trackEmail(getMediaTitleForTracking());
				});
			}
			// embed
			if (self.options.share.embed.enabled) {
				if (self.bbgCss.jq.sharePanel && self.bbgCss.jq.sharePanel.length > 0) {
					$(self.bbgCss.css.sharePanel + ' .instructions').html(self.options.share.embed.instructions);
					$(self.bbgCss.css.sharePanel + ' .share-hide').val(self.options.share.embed.hide);
					// use existing share panel
					if (!self.bbgCss.jq.share || self.bbgCss.jq.share.length == 0) {
						// add to share bar and save to bbgCss for usage later
						self.bbgCss.jq.shaare.append('<a href="javascript:;" class="jp-share">Share</a>');
						self.bbgCss.css.share = self.bbgCss.css.ancestor + ' .jp-share';
						self.bbgCss.jq.share = $(self.bbgCss.css.share);
					}
					// open share panel upon share link click
					self.bbgCss.jq.share.on('click',function(e) {
						displayShareOptions();
					});
					self.bbgCss.jq.share.show();
					self.bbgCss.jq.sharePanel.hide();
				} else {
					// no share panel defined
				}
			}
		}

		/**
		 * Populate the social media menu
		 */
		function generateSocialMediaMenu() {
			var markup = null;
			// facebook
			if (!!self.options.social.facebookUrl && self.options.social.facebookUrl !== undefined) {
				markup = '<li><a href="' + encodeURI(self.options.social.facebookUrl) + '" target="_blank" class="jp-facebook-social"><i class="icon-facebook icon-2x"></i><span>Facebook</span></a></li>';
				$(markup).appendTo(self.bbgCss.jq.social);
			}
			// twitter
			if (!!self.options.social.twitterHandle && self.options.social.twitterHandle !== undefined) {
				markup = '<li><a href="https://twitter.com/' + encodeURI(self.options.social.twitterHandle) + '" target="_blank" class="jp-twitter-social"><i class="icon-twitter icon-2x"></i><span>Twitter</span></a></li>';
				$(markup).appendTo(self.bbgCss.jq.social);
			}
			// google plus
			if (!!self.options.social.googlePlusUrl && self.options.social.googlePlusUrl !== undefined) {
				markup = '<li><a href="' + encodeURI(self.options.social.googlePlusUrl) + '" target="_blank" class="jp-google-plus-social"><i class="icon-google-plus icon-2x"></i><span>Google</span></a></li>';
				$(markup).appendTo(self.bbgCss.jq.social);
			}
			// website
			if (!!self.options.social.websiteUrl && self.options.social.websiteUrl !== undefined) {
				markup = '<li><a href="' + encodeURI(self.options.social.websiteUrl) + '" target="_blank" class="jp-web-social"><i class="icon-external-link icon-2x"></i> <span>Web</span></a></li>';
				$(markup).appendTo(self.bbgCss.jq.social);
			}

		}

		/**
		 * Displays the share options panel
		 */
		function displayShareOptions() {
			// if already showing, then toggle off
			if (self.bbgCss.jq.sharePanel.is(":visible")) {
				self.bbgCss.jq.sharePanel.hide();
				return;
			}
			// set the text for the copy area
			var embedWidth = self.bbgCss.jq.ancestor.width() + 10;
			var embedHeight = self.bbgCss.jq.ancestor.height() + 10;
			$(self.bbgCss.css.sharePanel + ' .jp-share-code').val(getCurrentEmbedCode(embedWidth,embedHeight));
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
			});
			// track the share request
			trackEmbed(getMediaTitleForTracking());
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
				width = 390;
			}
			if (typeof(height) == 'undefined') {
				height = 675;
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
	
});
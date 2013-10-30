
		function contentResize() {
	        $('#bbgContentTall').css('min-height', ($(window).height() - 85));
			$('.custom-SidePanel').css('min-height', $('#bbgContentTall').height());
	    }
	    contentResize();
	    $(window).resize(function () { contentResize(); });
		
		// class for the BBG podcast content
		function bbg_podcastContent(){
			this.title = '',
			this.desc  = '',
			this.dur   = '',
			this.url   = '',
			this.pub   = '',
			this.month = 0,
			this.year  = 0
		};
		// Array to hold all the podcast data
		var bbg_podcastArray = [];
		// document event to be triggered when the podcast menu option is clicked
		// the content is only pulled when the user clicks for podcast menus to reduce overhead of 
		// loading unnessecary data
		$(document).on('click', '.custom-SideMenu a[href^="#podcasts"]', function(){
			// check if the podcast content has already been captured
			// if it has, then we don't need to requery for more data
			if( !bbg_podcastArray || bbg_podcastArray.length < 1 ){
				
				// the Podcast stream/rss URL
				var stream = '';
				// where the XML file is at
				var feedXMLtitle = "config/" + app.config + ".xml";
					
				// CONNECT TO THE XML
				$.get(feedXMLtitle, function( data ) {
					$(data).find('playerconfig').each(function(){
						var $playerconfig = $(this);
						stream = $playerconfig.find('streams').find('item').find('podcastUrl').text();
					});			
				})
				.success(function() { 
				})
				.error(function() { 
				})
				.complete(function() { 
					// even if null the array is given an entry to escape the 
					// bbg_podcastArray.length condition -- reducing the XML call again	  
					bbg_podcastArray.push( stream );
					// function to call retrieve the JSON
					getJSONinfo( stream );
				});
				
			}
			
			// function to retrieve data from the JSON service
			function getJSONinfo( podcastPath ){
				// if the Stream URL is null or does not exist do not execute
				if( podcastPath && podcastPath != '' ){
					// clear the array for podcast content -- previously given the value of the stream URL
					bbg_podcastArray = [];
					var jsonPath = 'http://apps.innovation-series.com/streamreader/remote.feedparser.php?l=' + podcastPath;
					// CONNECT TO THE JSON
					$.ajax({
						url: jsonPath,
						dataType: 'json',
						success: function( data ){
							// call the function to parse the JSON data
							getJSONdata( data );
						},
						error: function(jqXHR, exception) {
							console.log( jqXHR.status + ' : ' + exception );
						}
					});
				}
				
				// function to parse the JSON data
				function getJSONdata( info ){
					if( info.length > 0 ){
						for( var x=0; x<info.length; x++ ){
							// assign the JSON elements to a podcast data class
							var tempPodcast = new bbg_podcastContent;
								tempPodcast.title = info[x]['title'];
								tempPodcast.desc  = info[x]['description'];
								tempPodcast.dur   = info[x]['duration'];
								tempPodcast.url   = info[x]['url'];
								tempPodcast.pub   = info[x]['published'];
								tempPodcast.month = info[x]['month'];
								tempPodcast.year  = info[x]['year'];
							// push data to the array
							bbg_podcastArray.push( tempPodcast );
						}
						// call the function to populate the HTML area of the podcast page
						populatePodcasts();
					}
				}
				
				// function to populate the HTML area of the podcast page
				function populatePodcasts(){
					// sinces arrays start at 0 and the months start at 1, leave a null entry in the first (0) area of the array.
					var months   = [ '', 'January ', 'February ', 'March ', 'April ', 'May ', 'June ', 'July ', 'August ', 'September ', 'October ', 'November ', 'December ' ];
					// newMonth is used to compare the months captured in the JSON which will in turn creates the wrapping div
					var newMonth = null;
					// variable to hold the HTML output. outputHeader is for the header on Details View
				    var output   = '',
				        outputHeader = '';
					
					for( var x=0; x<bbg_podcastArray.length; x++ ){
						if( bbg_podcastArray[x].month != newMonth ){
							// if we encounter a new month AND newMonth is not null, then close off the div for the previous month
							if( newMonth ){
								output += '</div><!-- END .bbgPodcastSection -->';
							}
							// if we are in a new month, then start the div and H3 for the new month
							newMonth = bbg_podcastArray[x].month;
							output += '<div class="bbgPodcastSection"><h3>';
							output += months[ parseInt(newMonth) ] + bbg_podcastArray[x].year;
							output += '</h3>';
							outputHeader = output;
						}
	                    
						var arrayDate = bbg_podcastArray[x].pub.split(' '),
						    justDate = '',
	                        justTime = '';

						for (var y = 0; y <= 5; y++) {
						    if (y === 0) {
						        justDate = arrayDate[y] + ' ';
						    } else if (y === 3) {
						        justDate += arrayDate[y];
						    } else if (y === 4) {
						        justTime = arrayDate[y] + ' ';
						    } else if (y === 5) {
						        justTime += arrayDate[y];
						    } else {
						        justDate += arrayDate[y] + ' ';
						    }
						}

						output += '<div class="bbgPCRow clearfix">' +
						            '<div class="bbgPCurl">' +
						                '<a href="javascript:playPodcast(\'' + bbg_podcastArray[x].url + '\');" class="podcast-play" >Play</a>' +
						                '<a href="javascript:;" class="podcast-pause" style="display: none;">Pause</a>' +
						                '<a href="javascript:;" class="podcast-resume" style="display: none;">Play</a>' +
						            '</div>' +
						            '<div class="bbgPCContents">' +
						                '<div class="bbgPCtitle">' + '<span>' + bbg_podcastArray[x].title + '</span>' + '<i class="bbgPodcastInfoDetails "></i>' + '</div>' +
										//'<div class="bbgPCtitle">' + '<span><a href="javascript:alert(\'test\');">' + bbg_podcastArray[x].title + '</a></span>' + '<i class="icon-info-sign bbgPodcastInfoDetails "></i>' + '</div>' +
						                '<div class="bbgDTL">' +
						                    '<div class="bbgDTL-Date"><span>Date:</span> ' + justDate + '</div>' +
						                    // '<div class="bbgDTL-Time"><span>Time:</span> ' + justTime + '</div>' +
						                    '<div class="bbgDTL-Length"><span>Length:</span> ' + bbg_podcastArray[x].dur + '</div>' +
						                '</div>' +
						            '</div>' +
						            '<input type="hidden" id="hdnPCUrl" value="' + bbg_podcastArray[x].url + '">' +
						            '<input type="hidden" id="hdnPCTitle" value="' + bbg_podcastArray[x].title + '">' +
						            '<input type="hidden" id="hdnPCDate" value="' + justDate + '">' +
						            '<input type="hidden" id="hdnPCTime" value="' + justTime + '">' +
						            '<input type="hidden" id="hdnPCDur" value="' + bbg_podcastArray[x].dur + '">' +
						            '<div id="hdnPCDesc" style="display: none;">' + bbg_podcastArray[x].desc + '</div>' +
						        '</div>';
					}
					$('#podcasts .custom-Content').html(output);
	                
				    /* 
	                    podcast-play is only shown to play the podcast since it carries the mp3 url
	                    when a user clicks podcast-play, it will show podcast-pause.
	                    when a user clicks podcast-pause, it will show podcast-resume.

	                    when a user selects another podcast, it destroys the previous one and creates a new one.
	                    when live stream is playing, it stops the live stream, hides the control and
	                    show the podcast player control
	                */
					$('.podcast-play').click(podcastPlayPauseToggle);
					$('.podcast-pause').click(podcastPlayPauseToggle);
					$('.podcast-resume').click(podcastPlayPauseToggle);

					// $('.bbgPCContents').click(showPodcastDetails);
					$('.bbgPCContents .icon-info-sign').click(showPCDetails);

					$('.jp-podcast-play').click({ isResumeClicked: true }, showHideMainPlayPauseBtns);
					$('.jp-podcast-pause').click({ isResumeClicked: false }, showHideMainPlayPauseBtns);
				}
				
			}
			
		});

	    // when a user clicks the play and pause button in the control,
	    // it should reflect the action on both the listsview and detailsview of the podcast
		function showHideMainPlayPauseBtns(e) {
	        
		    if (e.data.isResumeClicked) {
	            // listsView
		        $('.bbgPCRow.paused .bbgPCurl a').each(function () {
		            if ($(this).hasClass('podcast-play')) $(this).hide();
		            if ($(this).hasClass('podcast-pause')) $(this).show();
		            if ($(this).hasClass('podcast-resume')) $(this).hide();
		        });
		        $('.bbgPCRow.paused').removeClass('paused').addClass('playing');
		        // detailsView
		        $('.detailPC-play').hide();
		        $('.detailPC-pause').show();
		        $('.detailPC-resume').hide();

		    } else {

		        $('.bbgPCRow.playing .bbgPCurl a').each(function () {
		            if ($(this).hasClass('podcast-play')) $(this).hide();
		            if ($(this).hasClass('podcast-pause')) $(this).hide();
		            if ($(this).hasClass('podcast-resume')) $(this).show();
		        });
		        $('.bbgPCRow.playing').removeClass('playing').addClass('paused');

		        // detailsView
		        $('.detailPC-play').hide();
		        $('.detailPC-pause').hide();
		        $('.detailPC-resume').show();
		    }
		}

		function showPCDetails(){
			var renderHtml = '';

		    $('#podcasts .custom-Content').hide();			// hide podcast list
			$('.custom-SectionHeader.staticButton').hide(); // hide the default podcast breadcrumb
			$('.custom-SectionHeader.backButton').show(); 	// show back to podcast list button
			
			renderHtml =	'<h3>' + $(this).closest('.bbgPCRow').siblings('h3').text() + '</h3>' +
							'<div class="bbgDTWrapContent clearfix">' +
								'<div class="detailPCUrl">' +
									'<a href="javascript:playPodcast(\'' + $(this).closest('.bbgPCRow').children('#hdnPCUrl').val() + '\');" class="detailPC-play" style="' + $(this).closest('.bbgPCRow').find('.podcast-play').attr('style') + '" >Play</a>' +
									'<a href="javascript:;" class="detailPC-pause" style="' + $(this).closest('.bbgPCRow').find('.podcast-pause').attr('style') + '">Pause</a>' +
									'<a href="javascript:;" class="detailPC-resume" style="' + $(this).closest('.bbgPCRow').find('.podcast-resume').attr('style') + '">Play</a>' +
								'</div>' +
								'<div class="bbgDTWrapContent">' +
									'<div class="bbgPCtitle">' + $(this).closest('.bbgPCRow').children('#hdnPCTitle').val() + '</div>' +
									'<div class="bbgDTL">' +
										'<span class="bbgDTL-Date">Date: ' + $(this).closest('.bbgPCRow').children('#hdnPCDate').val() + '</span>' +
										'<span class="bbgDTL-Length">Length: ' + $(this).closest('.bbgPCRow').children('#hdnPCDur').val() + '</span>' +
									'</div>' +
									'<div class="bbgDesc">' + $(this).closest('.bbgPCRow').children('#hdnPCDesc').text() + '</div>' +
								'</div>' +
							'<div>'
			
			$('#podcastDetails').html(renderHtml).show(); // populate and show the generated HTML
			$('#showAllPodcasts').click($(this).closest('.bbgPCRow'), showPodcastList);
			$('.detailPC-play').click($(this).closest('.bbgPCRow'), podcastPlayPauseToggle);
		    $('.detailPC-pause').click($(this).closest('.bbgPCRow'), podcastPlayPauseToggle);
		    $('.detailPC-resume').click($(this).closest('.bbgPCRow'), podcastPlayPauseToggle);

		}

		function showPodcastDetails() {
	                
		    var renderHtml = '';

		    $('#podcasts .custom-Content').hide();
			
			$('.custom-SectionHeader.backButton').show(); //staticButton
			$('.custom-SectionHeader.staticButton').hide(); 
		
		    renderHtml = // '<a href="javascript:;" id="showAllPodcasts">Show All Podcasts</a>' +
	                    '<h3>' + $(this).closest('.bbgPCRow').siblings('h3').text() + '</h3>' +
						
						'<div class="bbgDTWrapContent clearfix">' +
						
							'<div class="detailPCUrl">' +
									'<a href="javascript:playPodcast(\'' + $(this).siblings('#hdnPCUrl').val() + '\');" class="detailPC-play" style="' + $(this).prev().find('.podcast-play').attr('style') + '" >Play</a>' +
									'<a href="javascript:;" class="detailPC-pause" style="' + $(this).prev().find('.podcast-pause').attr('style') + '">Pause</a>' +
									'<a href="javascript:;" class="detailPC-resume" style="' + $(this).prev().find('.podcast-resume').attr('style') + '">Play</a>' +
							'</div>' +
							'<div class="bbgDTWrapContent">' +
								'<div class="bbgPCtitle">' + $(this).siblings('#hdnPCTitle').val() + '</div>' +
								'<div class="bbgDTL">' +
									'<span class="bbgDTL-Date">Date: ' + $(this).siblings('#hdnPCDate').val() + '</span>' +
									// '<span class="bbgDTL-Time">Time: ' + $(this).siblings('#hdnPCTime').val() + '</span>' +
									'<span class="bbgDTL-Length">Length: ' + $(this).siblings('#hdnPCDur').val() + '</span>' +
								'</div>' +
								'<div class="bbgDesc">' + $(this).siblings('#hdnPCDesc').text() + '</div>' +
							'</div>' +
						'<div>'
						
						;
			
		    $('#podcastDetails').html(renderHtml).show();
		    $('#showAllPodcasts').click($(this).closest('.bbgPCRow'), showPodcastList);
		    $('.detailPC-play').click($(this).closest('.bbgPCRow'), podcastPlayPauseToggle);
		    $('.detailPC-pause').click($(this).closest('.bbgPCRow'), podcastPlayPauseToggle);
		    $('.detailPC-resume').click($(this).closest('.bbgPCRow'), podcastPlayPauseToggle);

		}

		function showPodcastList(e) {
			
			$('.custom-SectionHeader.backButton').hide();
			$('.custom-SectionHeader.staticButton').show(); 

		    var $targetContainerRow = $(e.data);
		    $targetContainerRow.find('.podcast-play').attr('style', $('.detailPC-play').attr('style'));
		    $targetContainerRow.find('.podcast-pause').attr('style', $('.detailPC-pause').attr('style'));
		    $targetContainerRow.find('.podcast-resume').attr('style', $('.detailPC-resume').attr('style'));

		    $('#podcastDetails').hide();
		    $('#podcasts .custom-Content').show();
		}

		function playPodcast(pcUrl) {

		    if ($('.jp-pause').css('display') === 'block') $("#jp-player").jPlayer("stop");

		    if (!isPodcastActive()) {
		        $('#jp-podcast-main-container').show();
		        $('#jp-player-main-container').hide();
		        playPauseToggle({ data: { value: false } });
		    }

		    destroyPodcastPlayer();

		    $('#jp-podcast').jPlayer({
		        ready: function(){
		            $(this).jPlayer('setMedia', {
		                mp3: pcUrl
		            }).jPlayer('play');
		        },
		        swfPath: '/js',
		        supplied: 'mp3',
		        cssSelectorAncestor: '#jp-podcast-container',
		        cssSelector: {
		            play: '.jp-podcast-play',
		            pause: '.jp-podcast-pause',
		            stop: '.jp-podcast-stop',
		            seekBar: '.jp-podcast-seek-bar',
		            playBar: '.jp-podcast-play-bar'
		        }
		    });                    
		}

		// mimic player button state
		$('.jp-play').click({ value: true }, playPauseToggle);
		$('.jp-pause').click({ value: false }, playPauseToggle);

		function podcastPlayPauseToggle(e) {

		    var $thisContainerRow = $(this).closest('.bbgPCRow'),
		        $targetContainerRow = $(e.data);
	        
		    // delete first .playing
		    $('.bbgPCRow').each(function () {
		        if ($(this).hasClass('playing')) $(this).removeClass('playing');
		        if ($(this).hasClass('paused')) $(this).removeClass('paused');
		        $(this).find('.podcast-play').show();
		        $(this).find('.podcast-pause').hide();
		        $(this).find('.podcast-resume').hide();
		    });
	                
	        // listsView
		    if ($(this).hasClass('podcast-play')) {
		        $(this).hide();
		        $(this).siblings('.podcast-resume').hide();
		        $(this).siblings('.podcast-pause').show();
		        if (!$thisContainerRow.hasClass('playing')) $thisContainerRow.addClass('playing');
		    }
		    if ($(this).hasClass('podcast-resume')) {
		        $(this).hide();
		        $(this).siblings('.podcast-play').hide();
		        $(this).siblings('.podcast-pause').show();
		        if (!$thisContainerRow.hasClass('playing')) $thisContainerRow.addClass('playing');
		        $('.jp-podcast-play').click();
		    }
		    if ($(this).hasClass('podcast-pause')) {
		        $(this).hide();
		        $(this).siblings('.podcast-play').hide();
		        $(this).siblings('.podcast-resume').show();
		        if (!$thisContainerRow.hasClass('paused')) $thisContainerRow.addClass('paused');
		        $('.jp-podcast-pause').click();
		    }

		    // detailsView
		    if ($(this).hasClass('detailPC-play')) {
		        $(this).hide();
		        $(this).siblings('.detailPC-resume').hide();
		        $(this).siblings('.detailPC-pause').show();
		        if (!$targetContainerRow.hasClass('playing')) $targetContainerRow.addClass('playing');
		    }
		    if ($(this).hasClass('detailPC-resume')) {
		        $(this).hide();
		        $(this).siblings('.detailPC-play').hide();
		        $(this).siblings('.detailPC-pause').show();
		        if (!$targetContainerRow.hasClass('playing')) $targetContainerRow.addClass('playing');
		        $('.jp-podcast-play').click();
		    }
		    if ($(this).hasClass('detailPC-pause')) {
		        $(this).hide();
		        $(this).siblings('.detailPC-play').hide();
		        $(this).siblings('.detailPC-resume').show();
		        if (!$targetContainerRow.hasClass('paused')) $targetContainerRow.addClass('paused');
		        $('.jp-podcast-pause').click();
		    }	    

		    $('.bbgPCRow.playing .podcast-pause').click(podcastPlayPauseToggle);
		    $('.bbgPCRow.paused .podcast-resume').click(podcastPlayPauseToggle);
		}


		// trigger click event for the live stream player
		$('#btnPlay').click(function () {
		    if (isPodcastActive()) {
		        $('#jp-podcast-main-container').hide();
		        $('#jp-player-main-container').show();
		        destroyPodcastPlayer();
		        $('#jp-player').jPlayer({
		            ready: function () {
		                alert('i am ready!');
		            }
		        });
		        setTimeout(function () {
		            onBtnPlayPauseClick({ data: { eventName: 'play' } });
		        }, 1000);
		    } else {
		        onBtnPlayPauseClick({ data: { eventName: 'play' } });
		    }
		});
		$('#btnPause').click({ eventName: 'pause' }, onBtnPlayPauseClick);

		function playPauseToggle(e) {

		    if (e.data.value) {
		        $('#btnPlay').hide();
		        $('#btnPause').show();
		    } else {
		        $('#btnPlay').show();
		        $('#btnPause').hide();
		    }
		}

		function onBtnPlayPauseClick(btn) {
	                
		    switch (btn.data.eventName) {
		        case 'play':
		            $('#jp-player').jPlayer('play');
		            playPauseToggle({ data: { value: true } });
		            break;
		        case 'pause':
		            $('#jp-player').jPlayer('pause');
		            playPauseToggle({ data: { value: false } });
		            break;
		        default:
		            break;
		    }

		}

		function isPodcastActive() {
		    return $('#jp-podcast-main-container').css('display') === 'block'
		}

		function activatePodcastPlayer() {
		    $('#jp-podcast').show();
		    $('#jp-player').hide();
		    setActivePlayerLabel();
		}

		function destroyPodcastPlayer() {
		    $('#jp-podcast').jPlayer('destroy');
		}

	// HELP: Accordion script

	$(document).on('click', '.custom-SideMenu a[href^="#help"]', function(){
		$('.panel-collapse').each(function(){
			if( !$(this).attr( 'data-height' ) ){
				$(this).attr('data-height', $(this).height() );
				$(this).height( 0 );
				$(this).hide();
			}
		});
	});

	var accordionActive = false;

	$('.accordion-toggle').click(function(e){
		e.preventDefault();
		if( !accordionActive ){
			accordionActive = true;
			var targetDiv = $(this).attr('href');
			if( $(targetDiv).hasClass( 'expanded' ) ){
				$(this).removeClass('icon-minus').addClass('icon-plus');
				$(targetDiv).removeClass( 'expanded' );
				$(targetDiv).animate({ height : 0 }, 500, 'linear', function(){
					$(this).hide();
					accordionActive = false;
				});
			}else{		
				$(this).removeClass('icon-plus').addClass('icon-minus');
				$(targetDiv).addClass( 'expanded' );
				var tdHeight = $(targetDiv).attr( 'data-height' );
				$(targetDiv).show().animate({ height : tdHeight }, 500, 'linear', function(){
					accordionActive = false;
				});
			}
		}
	});

	$(document).ready(function(){
		$('.custom-Preloader').delay( 500 ).fadeOut( function(){
			$('.audio-stream').show();
			$('.custom-MCArea').show();
			$('.custom-SideMenu').show();
		});
	});
	

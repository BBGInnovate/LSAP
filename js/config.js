require.config({
	baseUrl: 'js/',
	paths: {
		'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min',
		'bootstrap': '//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/js/bootstrap',
		'jquery.bbgPlayer.config': 'jquery.bbgPlayer.config.mobile'
	},
	shim: {
		'bootstrap': {
			deps: ['jquery']
		},
		'jquery.jplayer.min': {
			deps:	['jquery']
		},
		'jquery.jpanelmenu': {
			deps: ['jquery']
		},
		'qRespond.min': {
			deps: ['jquery']
		}
	}
});

// Menu Initialization
require(['jquery','bootstrap','jquery.jpanelmenu','jRespond.min'],function() {
	// set up the slide-out menu
	var jPM = $.jPanelMenu({
		openPosition: '150px'
	});
	
	// set up jRespond
	var jRes = jRespond([
	    //tablet and larger
	    {
	    	label: 'wideview',
	    	enter: 980,
	    	exit: 80000000
	    },
	    // portrait tablet and smaller
	    {
	    	label: 'narrowview',
	    	enter: 0,
	    	exit: 980
	    }
	]);
	
	jRes.addFunc({
		breakpoint: 'narrowview',
		enter: enterNarrowView,
		exit: exitNarrowView
	});
	
	// Breakpoint functions to handle the menu display
	function enterNarrowView() {
		jPM.on();
		$('.jPanelMenu-panel #menu').hide();
		$('#main').addClass('expanded');
		// make sure the new menu links also get the close handler
		$('.sidebar-nav').on('click','a',function(e) {
			jPM.close();
		});
		$('#content').removeClass('span10');
	}
	
	function exitNarrowView() {
		jPM.off();
		$('#menu').show();
		$('#main').removeClass('expanded');
		var test = $('#socialmini .dropdown-toggle');
		$('#socialmini').removeClass('open'); // close the dropdown menu if open when we switch from one view to the other
		$('#content').addClass('span10');
	}
	
	// close the menu when selecting a link in the menu
	$('.sidebar-nav').on('click','a',function(e) {
		jPM.close();
	});
	
	// resize content div upon window resize
	$(document).ready(function(){
	    resizeContent();

	    $(window).resize(function() {
	        resizeContent();
	    });
	});

	function resizeContent() {
		var winHeight = $(window).height();
		var footerHeight = $('footer').height();
		var navbarHeight = $('.navbar-fixed-top').height() - parseInt($('.navbar-fixed-top').css('margin-top'));
		var otherHeight = parseInt($('#main').css("padding-bottom"))/2; // this is the footer padding and is equal to the size of the footer
	    var contentHeight = winHeight - footerHeight - navbarHeight - otherHeight;
	    $('#content').height(contentHeight);
	}
});
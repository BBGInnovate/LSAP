jQuery(function () {
    var $LSAP = {
        init: function () {
/*
            // scrollbar logic
            var footerHeight = $('#footer').height(),
                windowHeight = $(window).height(),
                leftColHeight = $('.col-md-9').height() + 49;
            
            // make the right column same as custom-ContainerHeight
            $('.custom-ContainerHeight .row .col-md-3').height(leftColHeight);

            if (windowHeight - footerHeight > leftColHeight) {
                // - 3 is correction not to show scrollbar
                $('.custom-ContainerHeight .row .col-md-3').height(windowHeight - footerHeight - 3);
            }

            // on window resize
            $(window).resize(function () {
                windowHeight = $(window).height();

                if (windowHeight - footerHeight > leftColHeight) {
                    $('.custom-ContainerHeight .row .col-md-3').height(windowHeight - footerHeight - 3);
                }

            });
	*/		
			// on window resize
            $(window).resize(function () {
                 $('#footer').css('position','absolute');
            });




            //$('#hdnSongName').bind('DOMSubtreeModified', function () {
            //    console.log($(this).text().replace(' - ', ' - <br>'));
            //    $('#songName.jp-song').html('');
            //    $('#songName.jp-song').html($(this).text().replace(' - ', ' - <br>'));
            //});
        }
    }
    $LSAP.init();
});
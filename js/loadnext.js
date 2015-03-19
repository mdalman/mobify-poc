function getFallBackImageUrl(imageUrl){
    return imageUrl.replace('/high-res/','/low-res/');
}

function loadNextPage(event) {
    event.preventDefault();
    var nextUrl = $('#load-more').attr('href');
    $.getJSON(nextUrl, function (data) {
        $('#load-more').attr('href', data.next);
        var items = [];

        $.each(data.images, function (index, imageUrl) {
            var fallbackImageUrl = getFallBackImageUrl(imageUrl);
            var htmlRow = '<div class="col-xs-6">' +
                            '<img class="img-responsive" ' +
                                 'data-src="' + imageUrl + '" ' +
                                 'data-fallback-src="' + fallbackImageUrl + '" ' +
                                 '/>' +
                          '</div>';

            items.push(htmlRow);
        });
        html = items.join("");

        $('#load-more-container').before(html);
        loadImages();
        registerImageClicks();
    });

}

function clickImageHandler(event){
	var $target = $(event.target);
	var imageUrl = $target.attr('data-src');
	var fallbackImageUrl = $target.attr('data-fallback-src');;
	$('.img-preview').removeAttr('src').attr('data-src', imageUrl).attr('data-fallback-src',fallbackImageUrl);
    	$('#img-modal').modal('show'); 
    	
    	$('#img-modal').on('shown.bs.modal', function (e) {
  		loadImages();
	})
        
}

function registerImageClicks(){
	$('.img-responsive').on('click', clickImageHandler);
}

$(document).ready(function() {
    console.log('webp'+Modernizr.webp);
    loadImages();
    $('#load-more').click(loadNextPage);
    registerImageClicks();
});

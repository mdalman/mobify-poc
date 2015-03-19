function loadNextPage(event) {
    event.preventDefault();
    var nextUrl = $('#load-more').attr('href');
    $.getJSON(nextUrl, function (data) {
        $('#load-more').attr('href', data.next);
        var items = [];

        $.each(data.images, function (index, imageUrl) {
            var fallbackImageUrl = imageUrl.replace('/high-res/','/low-res/');
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
    });

}

$(document).ready(function() {
    console.log('webp'+Modernizr.webp);
    loadImages();
    $('#load-more').click(loadNextPage);
    $('.img-responsive').on('click', function() {
			$('.imagepreview').attr('data-src', $(this).attr('data-src'));
    		$('#imagemodal').modal('show'); 
            loadImages();  
		});
});

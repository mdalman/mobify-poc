function loadImages(event) {
    var $images = $('img:not([src])[data-src]');
    console.log($images);
    $images.each(function (index, image) {
        $image = $(image);
        $parent = $image.parent();
        var dataSrc = $image.attr('data-src');
        var opts = ResizeImages.processOptions();
        opts.quality = 20;
        opts.maxWidth = $parent.width() * devicePixelRatio;
        var optimizedUrl = ResizeImages.getImageURL(dataSrc,opts);
        $image.removeAttr('data-src').attr('src', optimizedUrl);
    });
}

function loadNextPage(event) {
    event.preventDefault();
    var nextUrl = $('#load-more').attr('href');
    $.getJSON(nextUrl, function (data) {
        $('#load-more').attr('href', data.next);
        var items = [];

        $.each(data.images, function (index, imageUrl) {
            var htmlRow = '<div class="row">' +
                    '<div class="col-md-6">' +
                        '<img class="img-responsive" data-src="' + imageUrl + '" />' +
                    '</div>' +
                '</div>';

            items.push(htmlRow);
        });
        html = items.join("");

        $('#load-more').before(html);
        loadImages();
    });

}

$(document).ready(function() {
    loadImages();
    $('#load-more').click(loadNextPage);
});

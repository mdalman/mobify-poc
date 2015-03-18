qualities = {4:{'zoom':55,'default':30},
              3:{'zoom':60,'default':35},
              2:{'zoom':65,'default':48},
              1:{'zoom':70,'default':60}}

function getQuality(pixelRatio,zoom){
    var qualityLookupKey = Math.min(4, pixelRatio);
    var quality = qualities[qualityLookupKey];
    if (zoom){
        return quality.zoom;
    }
    else{
        return quality.default;
    }
}

function loadImages(event) {
    var $images = $('img:not([src])[data-src]');
    console.log($images);
    $images.each(function (index, image) {
        var $image = $(image);
        var $parent = $image.parent();
        var cssWidth = $parent.width();
        var dataSrc = $image.attr('data-src');
        var opts = ResizeImages.processOptions();
        opts.quality = getQuality(devicePixelRatio,false);
        opts.maxWidth = cssWidth * devicePixelRatio;
        var optimizedUrl = ResizeImages.getImageURL(dataSrc,opts);
        var optimizedUrl = 'doink';
        $image.removeAttr('data-src').attr('src', optimizedUrl);
        $image.on('error',function(){alert('Error World')});
    });
}

function loadNextPage(event) {
    event.preventDefault();
    var nextUrl = $('#load-more').attr('href');
    $.getJSON(nextUrl, function (data) {
        $('#load-more').attr('href', data.next);
        var items = [];

        $.each(data.images, function (index, imageUrl) {
            var htmlRow = '<div class="col-xs-6">' +
                            '<img class="img-responsive" data-src="' + imageUrl + '" />' +
                          '</div>';

            items.push(htmlRow);
        });
        html = items.join("");

        $('#load-more-container').before(html);
        loadImages();
    });

}

$(document).ready(function() {
    loadImages();
    $('#load-more').click(loadNextPage);
});

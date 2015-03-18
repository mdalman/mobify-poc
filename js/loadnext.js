qualities = { 3:{'zoom':48,'default':35},//Morgan made up the 'default' from a nexus 5, 'zoom' value is a guess
              2:{'zoom':60,'default':48},//Both values are guesses
              1:{'zoom':70,'default':60}}//Both values are guesses

function getQuality(pixelRatio,zoom){
    var roundedPixelRatio = Math.floor(pixelRatio); //Error on the side of quality
    var qualityLookupKey = Math.min(3, roundedPixelRatio);

    var quality = qualities[qualityLookupKey];
    
    if (zoom){
        return quality.zoom;
    }
    else{
        return quality.default;
    }
}

function insertFallbackImageUrl(e){
              
    console.log('error world');
    var $image = $(e.target);
    $image.off('error'); //If we put another url in src that 404's we don't want an infinite loop
    
    console.log($image);
    var fallbackSrc = $image.attr('data-fallback-src')
    console.log(fallbackSrc);
    $image.attr('src',fallbackSrc);
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
        
        var pixelRatioOverride = purl(window.location).param('pr');
        
        var pixelRatio;
        if (typeof pixelRatioOverride === "undefined")
              {
              pixelRatio = devicePixelRatio;     
              }
        else{
               pixelRatio = pixelRatioOverride;
              }
        console.log('Pixel Ratio: '+pixelRatio);
        
        var qualityOverride = purl(window.location).param('q');

        var quality;
        if (typeof qualityOverride === "undefined") {
              quality = getQuality(pixelRatio,false);
              }
        else{
              quality = qualityOverride;
              
        }
       
        console.log('Quality: '+quality);
       
        opts.quality = quality;
        opts.maxWidth = Math.ceil(cssWidth * pixelRatio);
        var optimizedUrl = ResizeImages.getImageURL(dataSrc,opts);
        if(window.location.href.indexOf("fallback") > -1) {
              optimizedUrl = 'fail://this-is-not-a-valid-url-because-you-specified-fallback.jpg';
              }
        
        $image.removeAttr('data-src').attr('src', optimizedUrl);
        $image.on('error',insertFallbackImageUrl);
    });
}

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
    loadImages();
    $('#load-more').click(loadNextPage);
});

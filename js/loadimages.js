QUALITY_OVERRIDE_PARAMETER = 'q';
PIXEL_RATIO_OVERRIDE_PARAMETER = 'pr';
FALLBACK_TRIGGER_PARAMETER = 'fb';

IMAGE_URL_ATTRIBUTE_NAME = 'data-src'
IMAGE_URL_FALLBACK_ATTRIBUTE_NAME = 'data-fallback-src'

MINIMUM_PIXEL_RATIO = 1;
MAXIMUM_PIXEL_RATIO = 3;

QUALITIES = {
    1: {
        'zoom': 48,
        'regular': 35
    }, //Morgan made up the 'default' from a nexus 5, 'zoom' value is a guess
    2: {
        'zoom': 60,
        'regular': 48
    }, //Both values are guesses
    3: {
        'zoom': 70,
        'regular': 60
    } //Both values are guesses
};

function getUrlOverride(queryParameter, original) {
    var override = purl(window.location).param(queryParameter);
    if (typeof override === "undefined") {
        console.log('No override: '+queryParameter + '=' + original);
        return original;
    } else {
        console.log('Override: '+queryParameter + '=' + override);
        return override;
    }
}

function insertFallbackImageUrl(e) {

    var $image = $(e.target);
    $image.off('error'); //If we put another url in src that 404's we don't want an infinite loop
    var fallbackSrc = $image.attr(IMAGE_URL_FALLBACK_ATTRIBUTE_NAME);
    var src = $image.attr('src');
    console.log('Error loading: '+src+' reverting to fallback: '+fallbackSrc);
    $image.attr('src', fallbackSrc);
}

function roundToStep(rawValue, step) {
    return Math.ceil((rawValue) / step) * step;
}


function getImageUrl(originalUrl, width, quality) {
    var format;
    var pixelStep = 100;

    var steppedWidth = roundToStep(width, pixelStep);

    if (Modernizr.webp) {
        format = 'webp';
    } else {
        format = 'jpg';
    }
    return '//ir0.mobify.com/project-mobify-poc/c8/' + format + quality + '/' + steppedWidth + '/' + originalUrl;
}


function getPixelRatio() {
    var pixelRatio;

    if (typeof devicePixelRatio === "undefined") {
        pixelRatio = MINIMUM_PIXEL_RATIO;
    } else {
        pixelRatio = devicePixelRatio;
    }
    return getUrlOverride(PIXEL_RATIO_OVERRIDE_PARAMETER, pixelRatio );
}

function getQuality(pixelRatio, zoom) {
    var quality;
    var roundedPixelRatio = Math.floor(pixelRatio); //Error on the side of quality
    var qualityLookupKey = Math.min(MAXIMUM_PIXEL_RATIO, roundedPixelRatio); //pixel ratio higher than 3X will get same quality as 3X
    qualityLookupKey = Math.max(MINIMUM_PIXEL_RATIO, roundedPixelRatio); //pixel ratio less than 1X will get same quality as 1X

    var qualityObject = QUALITIES[qualityLookupKey];

    if (zoom) {
        quality = qualityObject.zoom;
    } else {
        quality = qualityObject.regular;
    }
    return getUrlOverride(QUALITY_OVERRIDE_PARAMETER, quality);
}


function loadImages(event) {
    var $images = $('img:not([src])['+IMAGE_URL_ATTRIBUTE_NAME+']');
    $images.each(function (index, image) {
        var $image = $(image);
        var $parent = $image.parent();
        var cssWidth = $parent.width();
        var dataSrc = $image.attr(IMAGE_URL_ATTRIBUTE_NAME);

        var pixelRatio = getPixelRatio();
        var quality = getQuality(pixelRatio);

        var maxWidth = Math.ceil(cssWidth * pixelRatio);

        var optimizedUrl = getImageUrl(dataSrc, maxWidth, quality);
        console.log(optimizedUrl);
        if (window.location.href.indexOf(FALLBACK_TRIGGER_PARAMETER) > -1) {
            optimizedUrl = 'fail://this-is-not-a-valid-url-because-you-specified-fallback.jpg';
        }

        $image.removeAttr(IMAGE_URL_ATTRIBUTE_NAME).attr('src', optimizedUrl);
        $image.on('error', insertFallbackImageUrl);
    });
}

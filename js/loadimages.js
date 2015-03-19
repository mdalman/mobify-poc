QUALITY_OVERRIDE_PARAMETER = 'q';
PIXEL_RATIO_OVERRIDE_PARAMETER = 'pr';
FALLBACK_TRIGGER_PARAMETER = 'fb';

IMAGE_URL_ATTRIBUTE_NAME = 'data-src';
IMAGE_URL_FALLBACK_ATTRIBUTE_NAME = 'data-fallback-src';

PIXEL_STEP = 100;

MINIMUM_PIXEL_RATIO = 1;
MAXIMUM_PIXEL_RATIO = 3;

IMAGE_RESIZE_PROXY_BASE = '//ir0.mobify.com/project-mobify-poc/c8/';

QUALITIES = {
	3: {
		'zoom': 48,
		'regular': 35
	}, //Morgan made up the 'default' from a nexus 5, 'zoom' value is a guess
	2: {
		'zoom': 60,
		'regular': 48
	}, //Both values are guesses
	1: {
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

function getImageFormat(){
	if (Modernizr.webp) {
		return 'webp';
	} else {
		return 'jpg';
	}
}

function getImageUrl(originalUrl, width, quality) {
	var format = getImageFormat();
	var pixelStep = PIXEL_STEP;

	var steppedWidth = roundToStep(width, pixelStep);

	var url = IMAGE_RESIZE_PROXY_BASE + format + quality + '/' + steppedWidth + '/' + originalUrl;
	var forceFallback = getUrlOverride(FALLBACK_TRIGGER_PARAMETER,false);
	if(forceFallback){
		url = 'fail://this-is-not-a-valid-url-because-you-specified-fallback.jpg';
	}
	console.log('Optimized url: '+url);
	return url;
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

function loadImage($image){
	var dataSrc = $image.attr(IMAGE_URL_ATTRIBUTE_NAME);

	var pixelRatio = getPixelRatio();
	var quality = getQuality(pixelRatio);
	
	var $parent = $image.parent();
	var cssWidth = $parent.width();
	var maxWidth = Math.ceil(cssWidth * pixelRatio);

	var optimizedUrl = getImageUrl(dataSrc, maxWidth, quality);

	$image.removeAttr(IMAGE_URL_ATTRIBUTE_NAME).attr('src', optimizedUrl);
	$image.on('error', insertFallbackImageUrl);
}

function loadImages(event) {
	var $images = $('img:not([src])['+IMAGE_URL_ATTRIBUTE_NAME+']');
	$images.each(function (index, image) {
		var $image = $(image);
		loadImage($image);
	});
}

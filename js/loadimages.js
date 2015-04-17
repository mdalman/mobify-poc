DEBUG = false;

IMAGE_TIMEOUT_LIMIT = 4000;//ms

QUALITY_OVERRIDE_PARAMETER = 'q';
PIXEL_RATIO_OVERRIDE_PARAMETER = 'pr';
FALLBACK_TRIGGER_PARAMETER = 'fb';
VENDOR_OVERRIDE_PARAMETER = 'v';

IMAGE_URL_ATTRIBUTE_NAME = 'data-src';
IMAGE_URL_FALLBACK_ATTRIBUTE_NAME = 'data-fallback-src';

PIXEL_STEP = 100;

MINIMUM_PIXEL_RATIO = 1;
MAXIMUM_PIXEL_RATIO = 3;

MAXIMUM_WIDTH = 4000;

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



if (DEBUG === false){
	console.log = function() {}
}


function getUrlOverride(queryParameter, original) {
	var override = purl(window.location).param(queryParameter);
	if (typeof override === "undefined" || override === "") {
		console.log('No override: '+queryParameter + '=' + original);
		return original;
	} else {
		console.log('Override: '+queryParameter + '=' + override);
		return override;
	}
}

function insertFallbackImageUrl(image) {
	clearTimeout(image.timer);
	var $image = $(image);
	var fallbackSrc = $image.attr(IMAGE_URL_FALLBACK_ATTRIBUTE_NAME);
	var src = $image.attr('src');
	console.log('Error loading: '+src+' reverting to fallback: '+fallbackSrc);
	$image.attr('src', fallbackSrc);
}

function handleImageError(e){
	var image = e.target;
	var $image = $(image);
	$image.off('error'); //If we put another url in src that 404's we don't want an infinite loop	
	insertFallbackImageUrl(image);
}


function roundToStep(rawValue, step) {
	return Math.ceil((rawValue) / step) * step;
}

function getImageFormat(){
	try{
		if (Modernizr.webp === true) {
			return 'webp';
		}	
	}
	catch(err){}
	return 'jpg';
}

function getImgixUrl(originalUrl, width, quality,format){
	var IMAGES_BASE_URL = '//mdalman.github.io/mobify-poc/images/';
	
	
	'http://mdalman.imgix.net/high-res/5040017_VLT43_ALT-LEFT.jpg?auto=format&fit=crop&h=480&q=80&w=940'
	var baseUrl = originalUrl.replace(/^(https?:)?\/\/mdalman.github.io\/mobify-poc\/images\//,
	                                    '//mdalman.imgix.net/');
	
	var processOptions = 'chester=facet'+'&fm='+format+'&w='+width+'&q='+quality;
//	var processOptions = 'auto=format&w='+width+'&q='+quality;//use content negotiation to determine format
	var optimizedUrl = baseUrl + '?' + processOptions;                              
	return optimizedUrl;
}

function getMobifyUrl(originalUrl, width, quality,format){
        var cleanedOriginal = originalUrl.replace(/^\/\//, 'http://'); //put a protocol on if none
	return IMAGE_RESIZE_PROXY_BASE + format + quality + '/' + width + '/' + cleanedOriginal;	
}

function getOptimizedUrl(originalUrl, width, quality,format){
	var vendor = getUrlOverride(VENDOR_OVERRIDE_PARAMETER,'mobify');
	if (vendor === 'imgix'){
		console.log('imgix');
		return getImgixUrl(originalUrl, width, quality,format)
		
	}
	else{
		return getMobifyUrl(originalUrl, width, quality,format);
	}
}

function getImageUrl(originalUrl, width, quality,format) {
        var url = getOptimizedUrl(originalUrl, width, quality,format)
	var forceFallback = getUrlOverride(FALLBACK_TRIGGER_PARAMETER,'');
	if(forceFallback === '404'){
		url = 'http://httpstat.us/404';
	}
	if(forceFallback === 'timeout'){
	        url = '//10.255.255.1/'+Math.random()+'.jpg';
	}
	if(forceFallback === '500'){
		url = 'http://httpstat.us/500';
	}
	
	console.log('Optimized url: '+url);
	return url;
}


function getPixelRatio() {
	var pixelRatio;

	try{
		pixelRatio = devicePixelRatio;	
	}
	catch(err){
		pixelRatio = MINIMUM_PIXEL_RATIO;
	}

	return getUrlOverride(PIXEL_RATIO_OVERRIDE_PARAMETER, pixelRatio );
}

function getLookupKeyFromPixelRatio(pixelRatio){
	var cleanedPixelRatio = Math.floor(pixelRatio); //Error on the side of quality
	if (cleanedPixelRatio > MAXIMUM_PIXEL_RATIO){
		cleanedPixelRatio = MAXIMUM_PIXEL_RATIO;
	}
	if (cleanedPixelRatio < MINIMUM_PIXEL_RATIO){
		cleanedPixelRatio = MINIMUM_PIXEL_RATIO;
	}
	return cleanedPixelRatio;
}

function getQuality(pixelRatio, zoom) {
	var quality;
	var key = getLookupKeyFromPixelRatio(pixelRatio);

	var qualityObject = QUALITIES[key];

	if (zoom) {
		quality = qualityObject.zoom;
	} else {
		quality = qualityObject.regular;
	}
	return getUrlOverride(QUALITY_OVERRIDE_PARAMETER, quality);
}

function loadImage(image){
	var $image = $(image);
	var dataSrc = $image.attr(IMAGE_URL_ATTRIBUTE_NAME);

	var pixelRatio = getPixelRatio();

	var zoomable = $image.hasClass('img-zoomable');

	var quality = getQuality(pixelRatio,zoomable);
	
	var $parent = $image.parent();
	var cssWidth = $parent.width();
	console.log('cssWidth: '+cssWidth);
	console.log('pixelRatio: '+pixelRatio);
	var targetWidth = Math.ceil(cssWidth * pixelRatio);
	if (targetWidth > MAXIMUM_WIDTH){
	      targetWidth = MAXIMUM_WIDTH;
	}

	var format = getImageFormat();
	var steppedTargetWidth = roundToStep(targetWidth, PIXEL_STEP);

	var optimizedUrl = getImageUrl(dataSrc, steppedTargetWidth, quality,format);
//	$image.attr('src', optimizedUrl).on('error', insertFallbackImageUrl);
        var tinySrc = $image.attr('src');
	$image.attr('src', optimizedUrl).attr('data-tiny-src',tinySrc).on('error', handleImageError);
	
/*	if (!image.complete) {
	        image.timer = setTimeout(function (){
	            insertFallbackImageUrl(image);
	        }, IMAGE_TIMEOUT_LIMIT);
	
	        $image.on('load', function () {
	            clearTimeout(image.timer);
	        });
        } //This doesn't really work yet*/
	
	
	
	
	//TODO: implement timeout logic: http://jsfiddle.net/d0upkg76/8/
}

function loadImages(event) {
//	var $images = $('img:not([src])['+IMAGE_URL_ATTRIBUTE_NAME+']');
	var $images = $('img:not([data-tiny-src])['+IMAGE_URL_ATTRIBUTE_NAME+']');
	$images.each(function (index, image) {
		
		loadImage(image);
	});
}

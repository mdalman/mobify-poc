qualities = { 3:{'zoom':48,'regular':35},//Morgan made up the 'default' from a nexus 5, 'zoom' value is a guess
              2:{'zoom':60,'regular':48},//Both values are guesses
              1:{'zoom':70,'regular':60}//Both values are guesses
};

function getUrlOverride(queryParameter,original){
    var override = purl(window.location).param(queryParameter);
    if (typeof override === "undefined"){
                  return original;
    }
    else{
                  return override;
    }
}

function insertFallbackImageUrl(e){
              
    console.log('error world');
    var $image = $(e.target);
    $image.off('error'); //If we put another url in src that 404's we don't want an infinite loop
    
    console.log($image);
    var fallbackSrc = $image.attr('data-fallback-src');
    console.log(fallbackSrc);
    $image.attr('src',fallbackSrc);
}

function roundToStep(rawValue,step){
    return Math.ceil((rawValue) / step) * step;
}


function getImageUrl(originalUrl,width,quality){
    var format;
    var pixelStep = 100;
    
    var steppedWidth = roundToStep(width,pixelStep);
    
    if(Modernizr.webp){
                  format = 'webp';
    }
    else{
                 format = 'jpg';
    }
    return '//ir0.mobify.com/project-mobify-poc/c8/'+format+quality+'/'+steppedWidth+'/'+originalUrl;
}


function getPixelRatio(){
              var pixelRatio;

                 if (typeof devicePixelRatio === "undefined")
                 {
                     pixelRatio = 1;     
                 }
                 else{
                     pixelRatio = devicePixelRatio;
                 }
                 return getUrlOverride('pr',pixelRatio,)
}

function getQuality(pixelRatio,zoom){
    var quality;
    var roundedPixelRatio = Math.floor(pixelRatio); //Error on the side of quality
    var qualityLookupKey = Math.min(3, roundedPixelRatio); //pixel ratio higher than 3X will get same quality as 3X
    qualityLookupKey = Math.max(1, roundedPixelRatio); //pixel ratio less than 1X will get same quality as 1X

    var qualityObject = qualities[qualityLookupKey];
    
    if (zoom){
        quality = qualityObject.zoom;
    }
    else{
        quality = qualityObject.regular;
    }
    return getUrlOverride('q',quality);
}


function loadImages(event) {
    var $images = $('img:not([src])[data-src]');
    console.log($images);
    $images.each(function (index, image) {
        var $image = $(image);
        var $parent = $image.parent();
        var cssWidth = $parent.width();
        var dataSrc = $image.attr('data-src');

        var pixelRatio = getPixelRatio();
        var quality = getQuality(pixelRatio);
       
        var maxWidth = Math.ceil(cssWidth * pixelRatio);

        var optimizedUrl = getImageUrl(dataSrc,maxWidth,quality);
        console.log(optimizedUrl);
        if(window.location.href.indexOf("fallback") > -1) {
              optimizedUrl = 'fail://this-is-not-a-valid-url-because-you-specified-fallback.jpg';
              }
        
        $image.removeAttr('data-src').attr('src', optimizedUrl);
        $image.on('error',insertFallbackImageUrl);
    });
}

qualities = { 3:{'zoom':48,'regular':35},//Morgan made up the 'default' from a nexus 5, 'zoom' value is a guess
              2:{'zoom':60,'regular':48},//Both values are guesses
              1:{'zoom':70,'regular':60}
};//Both values are guesses

function getQuality(pixelRatio,zoom){
    var roundedPixelRatio = Math.floor(pixelRatio); //Error on the side of quality
    var qualityLookupKey = Math.min(3, roundedPixelRatio); //pixel ratio higher than 3X will get same quality as 3X
    qualityLookupKey = Math.max(1, roundedPixelRatio); //pixel ratio less than 1X will get same quality as 1X

    var quality = qualities[qualityLookupKey];
    
    if (zoom){
        return quality.zoom;
    }
    else{
        return quality.regular;
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
              var pixelRatioOverride = purl(window.location).param('pr');
              var pixelRatio;
              if (typeof pixelRatioOverride === "undefined")
              {
                 if (typeof devicePixelRatio === "undefined")
                 {
                     pixelRatio = 1;     
                 }
                 else{
                     pixelRatio = devicePixelRatio;
                 }
              }
              else{
               pixelRatio = pixelRatioOverride;
              }
              console.log('Pixel Ratio: '+pixelRatio);   
              return pixelRatio
}

function getQualityWithOverride(pixelRatio){
        var qualityOverride = purl(window.location).param('q');

        var quality;
        if (typeof qualityOverride === "undefined") {
              quality = getQuality(pixelRatio,false);
              }
        else{
              quality = qualityOverride;
              
        }
        console.log('Quality: '+quality);
        return quality;
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
        var quality = getQualityWithOverride(pixelRatio);
       
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

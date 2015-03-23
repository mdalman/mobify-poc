function getTotalImageBandwidth(elements){
    var sum = 0;
    var requests = []
    $('img').each(function (index, img) {
    	try{
	        var urlToCheck = img.src;
	        if(urlToCheck !== ''){
                var request = $.getJSON("http://69.164.195.251/filesize/", 
                          {'urltocheck':urlToCheck},
                          function(data){sum+=data.size;});
                requests.push(request);                
	        }
    	}
    	catch(error){console.log(error);}
    });
    
    $.when.apply(this,requests).then(function( x ) {
      var kbs = Math.ceil(sum/Math.pow(2, 10));
      
      elements.html(kbs+'kb');
    });
 }

function getFallBackImageUrl(imageUrl){
    return imageUrl.replace('/high-res/','/low-res/');
}

function loadNextPage(event) {
    event.preventDefault();
    var nextUrl = $('#load-more').attr('href');
    $.getJSON(nextUrl, function (data) {
        $('#load-more').attr('href', data.next.replace(/^https?:\/\//,'//'));
        var items = [];

        $.each(data.images, function (index, imageUrl) {
            var fallbackImageUrl = getFallBackImageUrl(imageUrl);
            var quickSrc = getImageUrl(imageUrl, 100, 50,'jpg');
            var htmlRow = '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">' +
                            '<img class="img-responsive" ' +
                                 'data-src="' + imageUrl + '" ' +
                                 'src="' + quickSrc + '" ' +
                                 'data-fallback-src="' + fallbackImageUrl + '" ' +
                                 '/>' +
                          '</div>';

            items.push(htmlRow);
        });
        html = items.join("");

        $('#product-row').append(html);
        loadImages();
        registerImageClicks();
    });

}

function clickImageHandler(event){
	var $target = $(event.target);
	var imageUrl = $target.attr('data-src');
	var imageSrc = $target.attr('src');
	
	var fallbackImageUrl = $target.attr('data-fallback-src');

	$('.img-preview').off('error').removeAttr('data-tiny-src').attr('src',imageSrc).attr('data-src', imageUrl).attr('data-fallback-src',fallbackImageUrl);    	
	$('#img-modal').modal('show'); 
    	
    	$('#img-modal').on('shown.bs.modal', function (e) {
  		loadImages();
	})
        
}

function registerImageClicks(){
	$('.img-responsive').on('click', clickImageHandler);
}

$(document).ready(function() {
    $('select[name="q"] option[value="'+$.url(window.location).param('q')+'"]').prop('selected',true);
    $('select[name="pr"] option[value="'+$.url(window.location).param('pr')+'"]').prop('selected',true); 
    $('select[name="fb"] option[value="'+$.url(window.location).param('fb')+'"]').prop('selected',true); 
    $('select[name="v"] option[value="'+$.url(window.location).param('v')+'"]').prop('selected',true);     
	
    $('#pixel-ratio').append(getPixelRatio()+'X');
    $('#zoom-quality').append(getQuality(getPixelRatio(),true)+'%');
    $('#regular-quality').append(getQuality(getPixelRatio(),false)+'%');    
      
    
  //  console.log('webp'+Modernizr.webp);
    loadImages();
    $('#load-more').click(loadNextPage);
    
    
    registerImageClicks();
});

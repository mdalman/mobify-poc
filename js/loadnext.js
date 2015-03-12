function loadNextPage(event) {
    event.preventDefault();
    var nextUrl = $('#load-more').attr('href');
    $.getJSON(nextUrl, function (data) {
        $('#load-more').attr('href', data.next);
        var items = [];

        $.each(data.images, function (index, imageUrl) {
            console.log(imageUrl);
            var htmlRow = '<div class="row">' +
                '<div class="col-md-12">' +
                '<img class="img-responsive" src="' + imageUrl + '" />' +
                '</div>' +
                '</div>';

            items.push(htmlRow);
        });
        html = items.join("");

        $('#load-more').before(html);
    });

}

$(document).ready(function() {
    $('#load-more').click(loadNextPage);
});
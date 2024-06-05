$(function() {
    $('.tos').scroll(function() {
      var buffer = 100; //buffer in px per fixare mobile
      if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - buffer) {
        $('.acceptToS').prop('disabled', false);
      } else {
        $('.acceptToS').prop('disabled', true);
      }
    }).trigger('scroll');
});
  
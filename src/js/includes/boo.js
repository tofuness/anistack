//Boo.js, a simple tooltip plugin for jQuery

(function($){
	$.boo = function(options){
		var ops = {
			content: '<b>Hello world</b>',

		}
		if(options) $.extend(ops, options);

		var booTemplate = [
			'<div id="boo-' + Math.floor(Math.random() * 999999) + '" class="boo-container">',
				'<div class="boo-content">',
				'</div>',
			'</div>'
		]
		var booEl = $(booTemplate.join(''));

		booEl.find('.boo-content').html(ops.content);
		$('body').append(booEl);
		booEl.css('background', 'black');
	}
})(jQuery);
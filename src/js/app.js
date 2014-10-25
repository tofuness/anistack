$(document).ready(function(){
	// There should be something here
	$('#top-profile-wrap').click(function(){
		$('#top-profile-menu-wrap').toggleClass('visible');
	});

	var $profileMenuWrap = $('#top-profile-menu-wrap');

	$(document).click(function(e){
		if($profileMenuWrap.hasClass('visible') && !$(e.target).closest('#top-profile-wrap').length){
			if(!$(e.target).hasClass('top-profile-menu-link')){
				$profileMenuWrap.removeClass('visible');
			}
		}
	});

	$(window).on('resize', function(){
		$('.full-height').css({
			'height': $(window).height() - 52
		});
		$('.center-vert').each(function(){
			var $this = $(this);
			$this.css({
				'marginTop': $this.height() / 2 * -1
			});
		})
	});
	$(window).resize();

	$('<img/>').attr('src', $('#series-cover-bg').data('bg')).on('load', function(){
		$(this).remove();
		$('#series-cover-bg').css('background-image', 'url(' + $('#series-cover-bg').data('bg') + ')').velocity({
			scale: [1.1, 1.05],
			opacity: [1, 0],
			//width: ['100%', '110%'],
			translateX: [0, 20],
			translateY: [0, -20],
			borderTopLeftRadius: [0, $(window).height() / 2],
			borderTopRightRadius: [0, $(window).height() / 4],
			borderBottomRightRadius: [0, $(window).height() / 2],
			borderBottomLeftRadius: [0, $(window).height() / 1]
		}, {
			delay: 1000,
			duration: 600,
			easing: [0.23, 1, 0.32, 1]
		});
	});
	
	$.Velocity.RegisterEffect('herro.slideUpIn', {
		defaultDuration: 300,
		calls: [
			[{
				opacity: [1, 0],
				translateY: [0, 30],
				translateX: [0, 0]
			}, 1, {
				easing: [0.23, 1, 0.32, 1]
			}]
		]
	});
});
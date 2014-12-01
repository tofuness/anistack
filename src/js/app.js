$(document).ready(function() {
	
	// Show/Hide top-right user menu.
	$('#top-profile-wrap').click(function(){
		$('#top-profile-menu-wrap').toggleClass('visible');
	});

	var $profileMenuWrap = $('#top-profile-menu-wrap');

	// Hide top-right user menu if we click outside the element.
	$(document).click(function(e){
		if ($profileMenuWrap.hasClass('visible') && !$(e.target).closest('#top-profile-wrap').length) {
			if (!$(e.target).hasClass('top-profile-menu-link')) {
				$profileMenuWrap.removeClass('visible');
			}
		}
	});

	// Fittext
	$("#series-cover-title").fitText(1.2, { minFontSize: '37px', maxFontSize: '50px' });
	$("#search-result-title").fitText(1.2, { maxFontSize: '18px' });

	$(window).on('resize', function(){

		// Elements with class full-height gets adjusted on window resize.
		$('.full-height').css({
			'height': $(window).height() - 52
		});

		// Elements with center-vert gets verticalled centered on window resize.
		$('.center-vert').each(function() {
			var $this = $(this);
			$this.css({
				'marginTop': $this.height() / 2 * -1
			});
		});

		// Adjust large covers
		$('#series-cover-hd-wrap').css('height', $(window).height() * 0.6);
	});

	$('#logreg-error').velocity({
		opacity: [0, 1],
		height: [0, 'auto'],
		paddingTop: [0, 15],
		paddingBottom: [0, 15],
	}, {
		easing: [0.23, 1, 0.32, 1],
		delay: 5000,
		duration: 300
	});

	$('#series-info-nsfw-ovl').click(function() {
		$(this).toggleClass('hidden');
	});

	// Run window resize at least once so that the styles get apples.
	$(window).resize();

	// Preload the series cover then animate in.
	$('<img/>').attr('src', $('#series-cover-bg').data('bg')).on('load', function() {
		$(this).remove();
		$('#series-cover-bg').css('background-image', 'url(' + $('#series-cover-bg').data('bg') + ')')
		.velocity({
			//scale: [1.1, 1.05],
			opacity: [1, 0],
			translateY: [0, -10]
		}, {
			delay: 200,
			duration: 600,
			easing: [0.23, 1, 0.32, 1]
		});
	});

	// Custom slideUpIn transition that allows use for the stagger property.	
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
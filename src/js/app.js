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

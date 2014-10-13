// There should be something here
$('#top-profile-wrap').click(function(){
	$('#top-profile-menu-wrap').toggleClass('visible');
});

var $profileMenuWrap = $('#top-profile-menu-wrap');

$(document).click(function(e){
	if($profileMenuWrap.hasClass('visible') && !$(e.target).closest('#top-profile-wrap').length){
		$profileMenuWrap.removeClass('visible');
	}
});

$.Velocity.RegisterEffect('herro.slideUpIn', {
	defaultDuration: 300,
	calls: [
		[{
			opacity: [1, 0],
			translateY: [0, 20],
			translateX: [0, 0]
		}, 1, {
			easing: [0.23, 1, 0.32, 1]
		}]
	]
});

$('#settings-top>div').velocity('herro.slideUpIn', {
	delay: 300,
	stagger: 100
});
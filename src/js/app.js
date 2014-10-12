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
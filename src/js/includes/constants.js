var AppConstants = {
	CLOSE_VISIBLE: 'CLOSE_VISIBLE'
}

var ListConstants = {
	DATA_CHANGE: 'DATA_CHANGE'
}

var UserConstants = {
	LOGGED_IN: !!$('#top-profile-wrap').length,
	CSRF_TOKEN: $('#csrf-kek').val()
}

var easing = {
	easeOutQuart: [0.165, 0.84, 0.44, 1],
	easeOutQuint: [0.23, 1, 0.32, 1]
}
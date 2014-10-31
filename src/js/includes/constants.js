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
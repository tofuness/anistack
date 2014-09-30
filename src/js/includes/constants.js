var constants = {
	DATA_CHANGE: 'DATA_CHANGE',
	LIST_ERROR: 'LIST_ERROR',
	UPDATE_ITEM: 'UPDATE_ITEM',
	CLOSE_PICKERS: 'CLOSE_PICKERS'
}

var USER = {
	LOGGED_IN: !!$('#top-profile-name').length,
	USERNAME: $('#top-profile-name').text().toLowerCase()
}
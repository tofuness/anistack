'use strict';

var hAuth = require('../../helpers/auth');

module.exports = function(app) {
	app.route('/me/settings/:tab(basic|avatar|password|privacy)?')
	.all(hAuth.ifAuth)
	.get(function(req, res, next) {
		res.render('settings', {
			title: 'Settings',
			tab: req.param('tab')
		});
	});
}
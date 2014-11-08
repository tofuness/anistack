'use strict';

var db = require('../../models/db.js');
var hAuth = require('../../helpers/auth.js');
var User = db.User;

module.exports = function(app) {
	app.route('/list/:listType(anime|manga)/:username')
	.get(function(req, res, next) {
		User.findOne({
			username: req.param('username').toLowerCase()
		}, function(err, userDoc) {
			if (userDoc) {
				res.render('list', {
					title: userDoc.display_name,
					profile: userDoc,
					listType: req.param('listType'),
					editable: req.user && req.user.username === req.param('username').toLowerCase()
				});
			} else {
				next();
			}
		});
	});

	app.route('/list/:listType(anime|manga)')
	.all(hAuth.ifAuth)
	.get(function(req, res, next) {
		res.redirect('/list/' + req.param('listType') + '/' + req.user.username);
	});
}
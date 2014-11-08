'use strict';

var db = require('../../models/db.js');
var User = db.User;

module.exports = function(app) {
	app.route('/stacks/:username')
	.get(function(req, res, next) {
		User.findOne({
			username: req.param('username').toLowerCase()
		}, function(err, userDoc) {
			res.render('stacks', {
				profile: userDoc,
				editable:  req.user && req.user.username === req.param('username').toLowerCase()
			});
		});
	});
}
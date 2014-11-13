'use strict';

var db = require('../../models/db.js');
var User = db.User;

module.exports = function(app) {
	app.route('/stacks/view/:username')
	.get(function(req, res, next) {
		User.findOne({
			username: req.param('username')
		}, function(err, userDoc) {
			if (err || !userDoc) return next(new Error('User not found'));
			res.status(200).json(userDoc.stacks);
		});
	});
}
'use strict';

var db = require('../models/db.js');
var User = db.User;

module.exports = {
	ifAnyAuth: function(req, res, next) {
		// ?: Authenticates for both passport and API tokens
		if (req.body.username && req.body.api_token) {
			User.findOne({
				username: req.body.username,
				api_token: req.body.api_token
			}, function(err, userDoc) {
				if (err) return next(new Error('authentication error'));
				if (!userDoc) return next(new Error('invalid username/token combination'));
				if (userDoc) {
					req.user = userDoc;
					next();
				}
			});
		} else if (req.isAuthenticated()) {
			next();
		} else {
			req.logout();
			res.redirect('/login');
		}
	},
	ifAuth: function(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		} else {
			req.logout();
			res.redirect('/login');
		}
	},
	ifStaff: function(req, res, next) {
		var staffList = process.env.APP_STAFF ? process.env.APP_STAFF.split(',') : [];
		if (req.isAuthenticated() && staffList.indexOf(req.user.username) > -1) {
			next();
		} else {
			res.redirect('/login');
		}
	},
	unlessAuth: function(req, res, next) {
		if (req.isAuthenticated()) {
			res.redirect('/');
		} else {
			next();
		}
	}
}
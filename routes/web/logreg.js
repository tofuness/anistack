'use strict';

var db = require('../../models/db.js');
var User = db.User;
var passport = require('passport');
var hAuth = require('../../helpers/auth.js');
var shortId = require('shortid');

module.exports = function(app) {
	app.route('/login')
	.all(hAuth.unlessAuth)
	.get(function(req, res, next) {
		res.render('login', { title: 'Log In', error: req.flash('error') });
	})
	.post(passport.authenticate('local', {
		successRedirect: '/list/anime',
		failureRedirect: '/login',
		failureFlash: 'Sorry, seems like your username and/or password isn\'t right!'
	}));

	app.route('/register')
	.all(hAuth.unlessAuth)
	.get(function(req, res, next) {
		res.render('register', { title: 'Register', message: req.flash('message'), error: req.flash('error') });
	})
	.post(function(req, res, next) {
		var user = new User({
			display_name: req.body.username,
			username: req.body.username,
			password: req.body.password
		});
		if (req.body.email !== '') {
			user.email = req.body.email;
		}
		User.createOne(user, function(err, userDoc) {
			if (err) {
				console.log(err);
				req.flash('error', 'Make sure all fields are correct!');
				res.redirect('back');
			}
			if (userDoc) {
				req.login(userDoc, function(err) {
					return res.redirect('/onboard');
				});
			}
		});
	});

	app.route('/logout')
	.get(function(req, res, next) {
		req.logout();
		res.redirect('back');
	});

	app.route('/forgot')
	.all(hAuth.unlessAuth)
	.get(function(req, res, next) {
		res.render('forgot', { title: 'Forgot Password', message: req.flash('message'), error: req.flash('error') });
	})
	.post(function(req, res, next) {
		if (!req.body.email) {
			req.flash('error', 'Looks like you forgot to enter an email address...?');
			res.redirect('/forgot');
			return;
		}
		User.findOne({
			email: req.body.email.toLowerCase()
		}, function(err, userDoc) {
			if (err) {
				req.flash('error', 'Something went wrong on our side! Try again?');
				res.redirect('/forgot');
				return;
			}
			if (userDoc) {
				var resetToken = shortId.generate();
				User.updateOne({
					_id: userDoc._id
				}, {
					reset_pass_token: resetToken
				}, function(err, status){
					if (err || !status) {
						req.flash('error', 'Something went wrong on our side! Try again?');
						res.redirect('/forgot');
					}
					req.flash('message', 'An email with a reset link has been sent to you!');
					res.redirect('/forgot');
					console.log('mail');
				});
			} else {
				req.flash('error', 'Sorry, we couldn\'t find an user with that email address.');
				res.redirect('/forgot');
			}
		});
	});
}
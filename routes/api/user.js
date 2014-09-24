var request = require('request');
var db = require('../../models/db.js');
var User = db.User;
var _ = require('lodash');

module.exports = function(app){

	// ?: Check if an email already exists
	// Uses the mailgun API to check if the email address is valid first

	app.route('/validate/email')
	.post(function(req, res, next){
		if(req.body.email){
			request('https://api.mailgun.net/v2/address/validate?api_key=' + process.env.MAILGUN_PUBKEY + '&address=' + req.body.email, function(err, response, body){
				body = JSON.parse(body);
				console.log(body);
				if(!body.is_valid) return res.status(200).json({ status: 'ok', is_valid: false, exists: false });
				User.findOne({
					email: new RegExp('^' + req.body.email + '$', 'i')
				}, function(err, userDoc){
					if(err) return next(new Error('/validate/email error'));
					res.status(200).json({ status: 'ok', is_valid: true, exists: !!userDoc });
				});
			});
		} else {
			next(new Error('No email address provided'));
		}
	});

	// ?: Check if an username already exists

	app.route('/validate/username')
	.post(function(req, res, next){
		if(req.body.username){
			if(req.body.username.length < 3) return res.status(200).json({ status: 'ok', is_valid: false, exists: false });
			User.findOne({
				username: new RegExp('^' + req.body.username + '$', 'i')
			}, function(err, userDoc){
				if(err) return next(new Error('/validate/username error'));
				res.status(200).json({ status: 'ok', is_valid: true, exists: !!userDoc });
			});
		} else {
			next(new Error('No username provided'));
		}
	});

	app.route('/register')
	.post(function(req, res, next){
		var user = new User({
			display_name: req.body.username,
			username: req.body.username,
			password: req.body.password
		});
		if(req.body.email !== ''){
			user.email = req.body.email;
		}
		User.createOne(user, function(err, userDoc){
			if(err){
				console.log(err);
				return next(new Error('/register error'));
			}
			if(userDoc) return res.status(200).json({ status: 'ok', message: 'user has been regisered' });
		});
	});
}
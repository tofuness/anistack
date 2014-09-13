var request = require('request');
var db = require('../db.js');
var User = db.User;
var _ = require('lodash');

module.exports = function(app){
	app.route('/validate/email')
	.post(function(req, res, next){
		if(req.body.address){
			request('https://api.mailgun.net/v2/address/validate?api_key=' + process.env.MAINGUN_PUBKEY + '&address=' + req.body.address, function(err, response, body){
				body = JSON.parse(body);
				if(!body.is_valid) return res.status(200).json({ status: 'ok', is_valid: false, exists: false });
				User.findOne({
					email: new RegExp(req.body.address, 'i')
				}, function(err, userDoc){
					if(err) return next(new Error('Email validate error'));
					console.log(userDoc);
					res.status(200).json({ status: 'ok', is_valid: true, exists: !!userDoc });
				});
			});
		} else {
			next(new Error('No email address provided'));
		}
	});
}
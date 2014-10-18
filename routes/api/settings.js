var request = require('request');
var hAuth = require('../../helpers/auth.js');
var db = require('../../models/db.js');
var bcryptjs = require('bcryptjs');

var User = db.User;

var _ = require('lodash');

module.exports = function(app){
	app.route('/settings')
	.all(hAuth.ifAuth)
	.get(function(req, res, next){
		delete req.user.password;
		req.user.manga_list = [];
		req.user.anime_list = [];
		res.status(200).json(req.user);
	});

	app.route('/settings/basic')
	.all(hAuth.ifAuth)
	.post(function(req, res, next){
		var settingsObj = {};

		if(req.body.email && req.body.email !== req.user.email){
			settingsObj.email = req.body.email;
		}

		if(req.body.biography && req.body.biography !== req.user.biography){
			settingsObj.biography = req.body.biography;
		}

		if(req.body.avatar){
			if(req.user.avatar && req.user.avatar.original === req.body.avatar) return false;
			req.body.avatar = req.body.avatar.replace(/http(s)?:\/\//gi, '');
			if(/^i\.imgur\.com\/[0-9a-zA-Z]+\.(jpg|png)/i.test(req.body.avatar)){
				settingsObj['avatar.original'] = req.body.avatar;
			}
		}

		User.updateOne({
			_id: req.user._id
		}, settingsObj, function(err, status){
			if(err) return next(new Error(err));
			res.status(200).json({ status: 'OK', message: 'updated settings/basic' });
		});
	});

	app.route('/settings/password')
	.all(hAuth.ifAuth)
	.post(function(req, res, next){
		if(req.body.old_password && req.body.new_password){
			bcryptjs.compare(req.body.old_password, req.user.password, function(err, matched){
				if(!matched || err) return next(new Error('old password did not match'));
				User.updateOne({
					_id: req.user._id
				}, {
					password: req.body.new_password
				}, function(err, status){
					if(err) return next(new Error(err));
					res.status(200).json({ status: 'OK', message: 'updated settings/password' });
				});
			});	
		} else {
			return next(new Error('no old/new password was provided'));
		}
	});

	app.route('/settings/privacy')
	.all(hAuth.ifAuth)
	.post(function(req, res, next){
		console.log(req.body);
		var settingsObj = {
			settings: {
				anime_list_private: req.body.anime_list_private,
				manga_list_private: req.body.manga_list_private,
				collections_private: req.body.collections_private,
				stats_private: req.body.stats_private
			}
		};

		User.updateOne({
			_id: req.user._id
		}, settingsObj, function(err, status){
			if(err) return next(new Error(err));
			res.status(200).json({ status: 'OK', message: 'updated settings/privacy' });
		});
	});
}
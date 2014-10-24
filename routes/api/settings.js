var request = require('request');
var hAuth = require('../../helpers/auth.js');
var db = require('../../models/db.js');
var bcryptjs = require('bcryptjs');
var request = require('request');
var fs = require('fs');

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

		if(req.body.email !== req.user.email){
			settingsObj.email = req.body.email;
		}

		if(req.body.biography !== req.user.biography){
			settingsObj.biography = req.body.biography;
		}

		if(req.body.avatar && /^http(s)?:\/\/i\.imgur\.com\/[0-9a-zA-Z]+\.(jpg|png|gif)$/i.test(req.body.avatar)){
			request.head(req.body.avatar, function(err, result, body){
				var contentType = result.headers['content-type'].match(/^image\/(gif|jpeg|png)$/);
				if(!err && contentType){
					var downloadFrom = (contentType[1] === 'gif') ? 'http://localhost:8000/gif?url=' + req.body.avatar : 'https://images.weserv.nl/?w=250&h=250&t=squaredown&url=' + req.body.avatar.replace(/http(s)?:\/\//gi, '');
					request(downloadFrom)
					.pipe(fs.createWriteStream('./public/avatars/' + req.user.username + '.' + contentType[1], { flags: 'w' }))
					.on('close', function(err){
						settingsObj['avatar.original'] = req.body.avatar;
						settingsObj['avatar.processed'] = '/avatars/' + req.user.username + '.' + contentType[1];
						User.updateOne({
							_id: req.user._id
						}, settingsObj, function(err, status){
							if(err) return next(new Error(err));
							res.status(200).json({ status: 'ok', message: 'updated settings/basic', avatar: settingsObj['avatar.processed'] });
						});
					});
				} else {
					next(new Error('invalid imgur url'));
				}
			});
		} else {
			User.updateOne({
				_id: req.user._id
			}, settingsObj, function(err, status){
				if(err) return next(new Error(err));
				res.status(200).json({ status: 'ok', message: 'updated settings/basic' });
			});
		}
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
					res.status(200).json({ status: 'ok', message: 'updated settings/password' });
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
			res.status(200).json({ status: 'ok', message: 'updated settings/privacy' });
		});
	});
}
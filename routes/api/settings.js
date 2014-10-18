var request = require('request');
var hAuth = require('../../helpers/auth.js');
var db = require('../../models/db.js');
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
}
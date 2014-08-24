var db = require('../db.js');
var User = db.User;
var _ = require('lodash');

module.exports = function(app){
	var listType;

	// ?: Sets the list type

	app.route('/list/:list(anime|manga)*')
	.all(function(req, res, next){
		listType = req.param('list');
		next();
	});

	// ?: Get user's list

	app.route('/list/:list(anime|manga)/view/:username')
	.get(function(req, res, next){
		User.findOne({
			$or: [
				{ _id: req.param('username') },
				{ username: req.param('username') }
			]			
		}, {
			email: 0,
			password: 0,
			API_key: 0
		}, function(err, doc){
			if(err) return next(new Error(err));
			if(!doc) return next(new Error('User not found'));
			return res.status(200).json(doc[listType + '_list']);
		});
	});

	// ?: Add anime/manga to user's list

	app.route('/list/:list(anime|manga)/add/:username')
	.post(function(req, res, next){
		if(!req.body._id) return next(new Error('No _id was sent'));

		var ListItem = {
			item_progress: req.body.progress || 0,
			item_rating: req.body.rating || 0,
			item_status: req.body.status || 'current'
		}
		ListItem['_' + listType] = req.body._id;

		var updateList = (listType === 'anime') ? { anime_list: ListItem } : { manga_list: ListItem };

		User.updateOne({
			$or: [
				{ _id: req.param('username') },
				{ username: req.param('username') }
			]
		}, {
			$addToSet: updateList
		});
	});

	app.route('/list/:list(anime|manga)/remove/:username')
	.post(function(req, res, next){
		if(!req.body._id) return next(new Error('No _id was sent'));
		
		
	});
}
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
			_id: req.body._id,
			item_progress: req.body.progress || 0,
			item_rating: req.body.rating || 0,
			item_status: req.body.status || 'current'
		}

		var addListItem = (listType === 'anime') ? { anime_list: ListItem } : { manga_list: ListItem };

		User.updateOne({
			$or: [
				{ _id: req.param('username') },
				{ username: req.param('username') }
			]
		}, {
			$addToSet: addListItem
		}, function(err, status){
			if(err) return next(new Error(err));
			return res.status(200).json({ status: 'ok', message: 'Added list entry' });
		});
	});

	app.route('/list/:list(anime|manga)/update/:username')
	.post(function(req, res, next){
		if(!req.body._id) return next(new Error('No _id was sent'));

		var ListItem = {};
		if(req.body.progress) ListItem[listType + '_list.$.progress'] = req.body.progress;
		if(req.body.rating) ListItem[listType + '_list.$.rating'] = req.body.rating;
		if(req.body.status) ListItem[listType + '_list.$.status'] = req.body.status;

		var updateConditions = {};

		updateConditions['$or'] = [ { _id: req.param('username') }, { username: req.param('username') } ];

		if(listType === 'anime'){
			updateConditions['anime_list._id'] = req.body._id;
		} else {
			updateConditions['manga_list._id'] = req.body._id;
		}

		User.updateOne(updateConditions,{ $set: ListItem }, function(err, status){
			if(err) return next(new Error(err));
			return res.status(200).json({ status: 'ok', message: 'Updated list entry' });
		});
	});

	app.route('/list/:list(anime|manga)/delete/:username')
	.post(function(req, res, next){
		if(!req.body._id) return next(new Error('No _id was sent'));

		var removeListItem = (listType === 'anime') ? { anime_list: { _id: req.body._id } } : { manga_list: { _id: req.body._id } };

		User.updateOne({
			$or: [
				{ _id: req.param('username') },
				{ username: req.param('username') }
			]
		}, {
			$pull: removeListItem
		}, function(err, status){
			if(err) return next(new Error(err));
			return res.status(200).json({ status: 'ok', message: 'Deleted list entry' });
		});
	});
}
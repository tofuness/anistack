var db = require('../db.js');
var Anime = db.Anime;
var _ = require('underscore');

module.exports = function(app){
	var Collection;

	app.route('/:collection(anime|manga)*')
	.all(function(req, res, next){
		if(req.param('collection') === 'anime'){
			Collection = Anime;
		} else {
			Collection = Manga;
		}
		next();
	});

	app.route('/:collection(anime|manga)/all')
	.get(function(req, res, next){
		Collection.find({},function(err, docs){
			if(err) return next(err);
			res.status(200).json({ series: docs, count: docs.length });
		});
	});

	app.route('/:collection(anime|manga)/test')
	.get(function(req, res, next){
		// List all genres

		/*
		Collection.find({},function(err, docs){
			if(err) return next(err);
			var docsLen = docs.length;
			var uniqueGenres = [];
			for(var i = 0; i < docsLen; i++){
				uniqueGenres = uniqueGenres.concat(docs[i].series_genres);
			}
			res.status(200).json(_.uniq(uniqueGenres).sort());
		});
		*/
		
		// List all image references + _id

		Collection.find({}, { _id: 1, series_image_reference: 1 }, function(err, docs){
			if(err) return next(err);
			res.status(200).json(docs);
		});
	});

	app.route('/:collection(anime|manga)/:_id')
	.get(function(req, res, next){
		Collection.findOne({
			_id: req.param('_id')
		}, function(err, doc){
			if(err) return next(err);
			if(!doc) return next();
			res.status(200).json(doc);
		});
	});

	app.route('/:collection(anime|manga)/search/:query')
	.get(function(req, res, next){
		var searchQuery = req.param('query');
		var searchConditions = {
			$or: [
				{ series_title_main: new RegExp(searchQuery, 'gi') },				
				{ series_title_english: new RegExp(searchQuery, 'gi') },				
				{ series_title_romanji: new RegExp(searchQuery, 'gi') },
				{ series_title_japanese: new RegExp(searchQuery, 'gi') }
			]
		}
		Collection.find(searchConditions)
		.sort({ series_date_start: -1 })
		.limit(10)
		.exec(function(err, docs){
			if(err) return next(err);
			res.status(200).json(docs);
		});
	});
}
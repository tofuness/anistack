var db = require('../db.js');
var Anime = db.Anime;
var _ = require('lodash');

module.exports = function(app){
	var Collection;

	// ?: Sets the collection type

	app.route('/:collection(anime|manga)*')
	.all(function(req, res, next){
		if(req.param('collection') === 'anime'){
			Collection = Anime;
		} else {
			Collection = Manga;
		}
		next();
	});

	// ?: Get all anime/manga

	app.route('/:collection(anime|manga)/all')
	.get(function(req, res, next){
		Collection.find({},function(err, docs){
			if(err) return next(new Error(err));
			res.status(200).json({ series: docs, count: docs.length });
		});
	});

	// ?: Random thing used for testing

	app.route('/:collection(anime|manga)/test')
	.get(function(req, res, next){

		// ?: List all genres

		Collection.find({},function(err, docs){
			if(err) return next(err);
			var docsLen = docs.length;
			var uniqueGenres = [];
			for(var i = 0; i < docsLen; i++){
				uniqueGenres = uniqueGenres.concat(docs[i].series_genres);
			}
			res.status(200).json(_.uniq(uniqueGenres).sort());
		});
	});

	// ?: Get one anime/manga by _id

	app.route('/:collection(anime|manga)/:_id')
	.get(function(req, res, next){
		Collection.findOne({
			_id: req.param('_id')
		}, function(err, doc){
			if(err) return next(new Error(err));
			res.status(200).json(doc);
		});
	});

	// ?: Search for anime/manga, returns max 15 results, sorted by date in desc order

	app.route('/:collection(anime|manga)/search/:query')
	.get(function(req, res, next){
		var searchQuery = req.param('query');
		var searchConditions = {
			$or: [
				{ series_title_main: new RegExp(searchQuery, 'gi') },				
				{ series_title_english: new RegExp(searchQuery, 'gi') },				
				{ series_title_romanji: new RegExp(searchQuery, 'gi') },
				{ series_title_japanese: new RegExp(searchQuery, 'gi') },
				{ series_title_synonyms: new RegExp(searchQuery, 'gi') },
			]
		}
		Collection.find(searchConditions)
		.sort({ series_date_start: -1 })
		.limit(15)
		.exec(function(err, docs){
			if(err) return next(new Error(err));
			res.status(200).json(docs);
		});
	});
}
var db = require('../../models/db.js');
var hAuth = require('../../helpers/auth.js');
var Anime = db.Anime;
var Manga = db.Manga;
var _ = require('lodash');

module.exports = function(app) {
	var Collection;

	// ?: Sets the collection type
	app.route('/:collection(anime|manga)*')
	.all(function(req, res, next) {
		if (req.param('collection') === 'anime') {
			Collection = Anime;
		} else {
			Collection = Manga;
		}
		next();
	});

	// ?: Get all anime/manga
	app.route('/:collection(anime|manga)/all')
	.all(hAuth.ifStaff)
	.get(function(req, res, next) {
		Collection.find({}, function(err, docs) {
			if (err) return next(new Error(err));
			res.status(200).json({ series: docs, count: docs.length });
		});
	});

	// ?: Random thing used for testing
	app.route('/:collection(anime|manga)/test')
	.get(function(req, res, next) {

		// ?: List all genres
		Collection.find({}, function(err, docs) {
			if (err) return next(err);
			var docsLen = docs.length;
			var uniqueGenres = [];
			for(var i = 0; i < docsLen; i++){
				uniqueGenres = uniqueGenres.concat(docs[i].series_genres);
			}
			res.status(200).json(_.uniq(uniqueGenres).sort());
		});
	});

	// ?: Get one anime/manga by _id
	app.route('/:collection(anime|manga)/view/:_id')
	.get(function(req, res, next) {
		var searchConditions = {};

		if (req.param('_id').match(/^[0-9a-fA-F]{24}$/)) {
			searchConditions['_id'] = req.param('_id');
		} else {
			searchConditions['series_slug'] = req.param('_id');
		}

		Collection.findOne(searchConditions, function(err, seriesDoc) {
			if (err) return next(new Error(err));
			if (!seriesDoc) return next(new Error('series not found'));

			seriesDoc = seriesDoc.toObject();
			
			if (req.user && req.user[req.param('collection') + '_list']) {
				seriesDoc['item_data'] = _.find(req.user[req.param('collection') + '_list'], { _id: seriesDoc._id });
			}
			res.status(200).json(seriesDoc);
		});
	});

	// ?: Search for anime/manga, returns max 15 results, sorted by date in desc order
	app.route('/:collection(anime|manga)/search/:query')
	.get(function(req, res, next) {
		if (!req.param('query')) return res.status(200).json([]);
		var searchQuery = req.param('query');
		var dbSearchQuery;

		if (searchQuery.match(/^".*"$/)) {
			dbSearchQuery = new RegExp('^' + searchQuery.substring(1, searchQuery.length - 1) + '$', 'i');
		} else {
			dbSearchQuery = new RegExp(searchQuery, 'gi');
		}
		
		var searchConditions = {
			$or: [
				{ series_title_main: dbSearchQuery },				
				{ series_title_english: dbSearchQuery },				
				{ series_title_romanji: dbSearchQuery },
				{ series_title_japanese: dbSearchQuery },
				{ series_title_synonyms: dbSearchQuery },
			]
		}
		Collection.find(searchConditions)
		.limit(15)
		.exec(function(err, docs) {
			if (err) return next(new Error(err));
			var sortedDocs = _.sortBy(docs, function(series) {

				// Hacky sort function
				return ['movie', 'tv', 'manga'].indexOf(series.series_type) * -1;
			});

			sortedDocs = sortedDocs.map(function(series) {
				return series.toObject();
			});

			if (req.user && req.user[req.param('collection') + '_list']) {
				for(var i = 0; i < sortedDocs.length; i++){
					var findRes = _.find(req.user[req.param('collection') + '_list'], {
						_id: sortedDocs[i]._id
					});
					if (findRes){
						sortedDocs[i]['item_data'] = findRes;
					}
				}
			}
			res.status(200).json(sortedDocs).end();
		});
	});
}
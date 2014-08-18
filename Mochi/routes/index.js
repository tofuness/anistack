var db = require('../../API/db.js');
var _ = require('underscore');

var CorrectSchemaValues = function(seriesInfo){
	seriesInfo['series_type'] = seriesInfo['series_type'].toLowerCase();
	if(seriesInfo['series_date_start']) seriesInfo['series_date_start'] = new Date(seriesInfo['series_date_start']);
	if(seriesInfo['series_date_end']) seriesInfo['series_date_end'] = new Date(seriesInfo['series_date_end']);
	if(seriesInfo['series_genres']){
		seriesInfo['series_genres'] = seriesInfo['series_genres'].map(function(genre){
			return genre.toLowerCase();
		});
		seriesInfo['series_genres'] = _.uniq(seriesInfo['series_genres']);
	}
	if(seriesInfo['series_external_links']){
		seriesInfo['series_external_links'] = _.uniq(seriesInfo['series_external_links']);
	}
	return seriesInfo;
}

module.exports = function(app){
	var AnimeSchema = {
		series_title_english: '',
		series_title_japanese: '',
		series_title_romanji: '',
		series_type: '',
		series_date_start: '',
		series_date_end: '',
		series_synopsis: '',
		series_episodes_total: 0,
		series_image_original: '',
		series_image_processed: '',
		series_gallery: [],
		series_genres: [],
		series_external_links: []
	}
	app.route('/:collection(anime|manga)/add')
	.get(function(req, res, next){
		var collectionSchema;
		(req.param('collection') === 'anime') ? collectionSchema = AnimeSchema : collectionSchema = MangaSchema;
		res.render('editor', { initialValue: JSON.stringify(collectionSchema, null, '\t'), params: req.params });
	})
	.post(function(req, res, next){
		console.log(req.param('seriesInfo'));

		var collectionSchema = (req.param('collection') === 'anime') ? new db.Anime(req.param('seriesInfo')) : new db.Manga(req.param('seriesInfo'));
		collectionSchema.save(function(err, doc){
			if(err){
				console.log(err);
				res.status(500).end(err.message);
			} else {
				res.status(200).end(JSON.stringify(doc));
			}
		});
	});

	app.route('/:collection(anime|manga)/edit/:_id')
	.get(function(req, res, next){
		var collection = (req.param('collection') === 'anime') ? db.Anime : db.Manga;
		collection.findOne({
			_id: req.param('_id')
		}, function(err, doc){
			if(err){
				next();
			} else {
				res.render('editor', { initialValue: JSON.stringify(doc, null, '\t'), params: req.params });
			}
		});
	})
	.post(function(req, res, next){
		var collection = (req.param('collection') === 'anime') ? db.Anime : db.Manga;
		var seriesInfo = req.param('seriesInfo');
		console.log(seriesInfo);
		collection.updateOne({
			_id: req.param('_id')
		}, seriesInfo, function(err, doc){
			if(err){
				console.log(err);
				res.status(500).end(err.message);
			} else {
				res.status(200).end();
			}
		});
	});

	app.route('/:collection(anime|manga)/delete/:_id')
	.post(function(req, res, next){
		var collection = (req.param('collection') === 'anime') ? db.Anime : db.Manga;
		collection.remove({
			_id: req.param('_id')
		}, function(err, doc){
			if(err){
				console.log(err);
				res.status(500).end(err.message);
			} else {
				res.status(200).end();
			}
		});
	});

	app.route('/:collection(anime|manga)?')
	.get(function(req, res, next){
		if(!req.param('collection')) req.params.collection = 'anime';
		var collection = (req.param('collection') === 'anime') ? db.Anime : db.Manga;
		if(req.query.sq){
			var searchQuery = {
				$or: [
					{ series_title_english: new RegExp(req.query.sq, 'gi') },					
					{ series_title_romanji: new RegExp(req.query.sq, 'gi') }
				]
			}
		} else {
			var searchQuery = {}
		}
		collection.find(searchQuery, function(err, docs){
			if(err){
				next();
			} else {
				res.render('index', { results: docs, params: req.params });
			}
		});
	});
}
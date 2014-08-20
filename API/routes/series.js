var db = require('../db.js');
var Anime = db.Anime;

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
			res.status(200).json(docs);
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
		.limit(1)
		.exec(function(err, docs){
			if(err) return next(err);
			res.status(200).json(docs);
		});
	});
}
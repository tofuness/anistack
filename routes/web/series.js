var db = require('../../models/db.js');
var Anime = db.Anime;
var Manga = db.Manga;
var _ = require('lodash');

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

	app.route('/:collection(anime|manga)/:_id')
	.get(function(req, res, next){
		Collection.findOne({
			_id: req.param('_id')
		}, function(err, seriesDoc){
			if(err || !seriesDoc) return next();
			res.render('series', {
				collection: req.param('collection'),
				series: seriesDoc
			});
		});
	});
}
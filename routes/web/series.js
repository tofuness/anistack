'use strict';

var db = require('../../models/db.js');
var S = require('string');
var Anime = db.Anime;
var Manga = db.Manga;

module.exports = function(app) {
	var Collection;

	app.route('/:collection(anime|manga)*')
	.all(function(req, res, next) {
		if (req.param('collection') === 'anime') {
			Collection = Anime;
		} else {
			Collection = Manga;
		}
		next();
	});

	app.route('/:collection(anime|manga)/:slug')
	.get(function(req, res, next) {
		Collection.findOne({
			series_slug: req.param('slug')
		}, function(err, seriesDoc) {
			if (err || !seriesDoc){
				return next();
			}

			seriesDoc = seriesDoc.toObject();
			seriesDoc.series_description = (seriesDoc.series_description) ? S(seriesDoc.series_description).lines() : '';

			res.render('series-no-cover', {
				title: seriesDoc.series_title_main,
				useCover: false,
				collection: req.param('collection'),
				series: seriesDoc
			});
		});
	});
}
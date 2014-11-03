'use strict';

var db = require('../../models/db.js');
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

			var pageDesign = seriesDoc.series_image_cover ? 'series' : 'series-no-cover';

			res.render(pageDesign, {
				title: seriesDoc.series_title_main,
				useCover: pageDesign === 'series',
				collection: req.param('collection'),
				series: seriesDoc.toObject()
			});
		});
	});
}
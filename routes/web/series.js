'use strict';

var db = require('../../models/db.js');
var Anime = db.Anime;
var Manga = db.Manga;
var _ = require('lodash');

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
			if (err || !seriesDoc) {
				next();
			} else {
				seriesDoc = seriesDoc.toObject();
				seriesDoc.series_synopsis = (seriesDoc.series_synopsis) ? seriesDoc.series_synopsis.replace('\r\n', '\n').split('\n') : '';

				var pageDesign;
				if (req.user && !req.user.settings.series_show_cover && seriesDoc.series_image_cover) {
					pageDesign = 'series-no-cover';
				} else {
					pageDesign = (seriesDoc.series_image_cover) ? 'series' : 'series-no-cover';
				}

				if (seriesDoc.series_episodes_files) {
					// Hacky, but I guess it works?
					seriesDoc.series_episodes_files = _.sortBy(seriesDoc.series_episodes_files, function(item) {
						return parseFloat(item.episode_title.replace(/Episode /gi, '')) || -1;
					});
				}

				res.render(pageDesign, {
					title: seriesDoc.series_title_main,
					collection: req.param('collection'),
					series: seriesDoc
				});
			}
		});
	});

	app.route('/anime/:slug/:episode_title')
	.get(function(req, res, next) {
		Collection.findOne({
			series_slug: req.param('slug')
		}, function(err, seriesDoc) {
			if (err || !seriesDoc) {
				next();
			} else {
				var episodeData = _.find(seriesDoc.series_episodes_files, {
					episode_title: req.param('episode_title')
				});
				if (episodeData) {
					res.render('series-episode', {
						title: seriesDoc.series_title_main + ' Episode ' + episodeData.episode_number,
						series: seriesDoc,
						collection: 'anime',
						episode: episodeData
					});
				} else {
					next();
				}
			}
		});
	});
}
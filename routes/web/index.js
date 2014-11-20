'use strict';

module.exports = function(app) {
	app.route('/')
	.get(function(req, res, next) {
		res.render('landing', { title: 'Simple, Anime & Manga Tracking' });
	});
}
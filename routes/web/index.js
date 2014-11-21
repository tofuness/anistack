'use strict';

module.exports = function(app) {
	app.route('/')
	.get(function(req, res, next) {
		res.render('landing', { title: 'Simple, Anime & Manga Tracking' });
	});

	app.route('/whatisthis')
	.get(function(req, res, next) {
		var aboutTitle = req.user ? 'What is Anistack? (In case you forgot ' + req.user.username + ')' : 'What is Anistack?';
		res.render('about', { title: aboutTitle });
	});
}
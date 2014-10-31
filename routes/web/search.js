'use strict';

module.exports = function(app) {
	app.route('/search/:collection(anime|manga)/:query?')
	.get(function(req, res, next) {
		res.render('search', {
			collection: req.param('collection'),
			title: 'Search',
			query: req.param('query')
		});
	});
}
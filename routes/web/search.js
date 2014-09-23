module.exports = function(app){
	app.route('/search/:query?')
	.get(function(req, res, next){
		res.render('search', { collection: req.param('collection'), title: 'Search', query: req.param('query') });
	});
}
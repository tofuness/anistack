module.exports = function(app){
	app.route('/search')
	.get(function(req, res, next){
		res.render('search', { collection: req.param('collection'), title: 'Search' });
	});
}
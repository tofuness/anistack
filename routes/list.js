module.exports = function(app){
	app.route('/list/anime')
	.get(function(req, res, next){
		res.render('list');
	});

	app.route('/list/picker')
	.get(function(req, res, next){
		res.render('picker');
	});
}
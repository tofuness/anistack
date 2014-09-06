module.exports = function(app){
	app.route('/login')
	.get(function(req, res, next){
		res.render('login');
	});
}
module.exports = function(app){
	app.route('/login')
	.get(function(req, res, next){
		res.render('login', { title: 'Log In' });
	});

	app.route('/register')
	.get(function(req, res, next){
		res.render('register', { title: 'Register' });
	})
	.post(function(req, res, next){

	});
}
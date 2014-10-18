var passport = require('passport');
var hAuth = require('../../helpers/auth.js');

module.exports = function(app){
	app.route('/login')
	.all(hAuth.unlessAuth)
	.get(function(req, res, next){
		res.render('login', { title: 'Log In', error: req.flash('error') });
	})
	.post(passport.authenticate('local', {
		successRedirect: '/list/anime',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.route('/register')
	.all(hAuth.unlessAuth)
	.get(function(req, res, next){
		res.render('register', { title: 'Register' });
	});

	app.route('/logout')
	.get(function(req, res, next){
		req.logout();
		res.redirect('back');
	});
}
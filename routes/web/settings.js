var hAuth = require('../../helpers/auth');

module.exports = function(app){
	app.route('/me/settings')
	.all(hAuth.ifAuth)
	.get(function(req, res, next){
		res.render('settings');
	});
}
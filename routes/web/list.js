var db = require('../../models/db.js');
var hAuth = require('../../helpers/auth.js');
var listValidate = require('../../helpers/validateListData.js');
var User = db.User;

module.exports = function(app) {
	app.route('/list/:listType(anime|manga)/:username')
	.get(function(req, res, next) {
		User.findOne({
			username: req.param('username').toLowerCase()
		}, function(err, userDoc) {
			var listEditable = false;;
			if (req.user && req.user.username === req.param('username').toLowerCase()) {
				listEditable = true;
			}
			if (userDoc) {
				res.render('list', {
					title: userDoc.display_name,
					profile: userDoc,
					listType: req.param('listType'),
					listEditable: listEditable
				});
			} else {
				next();
			}
		});
	});

	app.route('/list/:listType(anime|manga)')
	.all(hAuth.ifAuth)
	.get(function(req, res, next) {
		res.redirect('/list/' + req.param('listType') + '/' + req.user.username);
	});
}
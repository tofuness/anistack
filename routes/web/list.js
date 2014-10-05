var db = require('../../models/db.js');
var hAuth = require('../../helpers/auth.js');
var listValidate = require('../../helpers/validateListData.js');
var User = db.User;

module.exports = function(app){
	app.route('/list/:listType(anime|manga)/:username')
	.get(function(req, res, next){
		User.findOne({
			username: req.param('username').toLowerCase()
		}, function(err, userDoc){
			if(userDoc){
				res.render('list', {
					profile: userDoc,
					listType: req.param('listType'),
					listEditable: req.user.username === req.param('username').toLowerCase()
				});
			} else {
				next();
			}
		});
		
	});
}
module.exports = {
	ifAuth: function(req, res, next){
		if(req.isAuthenticated()){
			next();
		} else {
			req.logout();
			res.redirect('/login');
		}
	},
	unlessAuth: function(req, res, next){
		if(req.isAuthenticated()){
			res.redirect('/');
		} else {
			next();
		}
	}
}
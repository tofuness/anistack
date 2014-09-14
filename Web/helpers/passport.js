var passport = require('passport');
var LocalStrategy = require('passport-local');
var bcryptjs = require('bcryptjs');

var db = require('../../API/db.js');
var User = db.User;

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	User.findOne({ username: new RegExp(username, 'i') }, { password: 0, API_Key: 0 }, function(err, user){
		done(err, user);
	});
});

passport.use(new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	}, function(username, password, done){
		User.findOne({
			username: new RegExp(username, 'i')
		}, function(err, userDoc){
			if(err) return new Error('auth db error');
			if(userDoc){
				bcryptjs.compare(password, userDoc.password, function(err, res){
					if(res) done(err, userDoc);
					if(!res) done(err, false);
				});
			}
		});
	}
));
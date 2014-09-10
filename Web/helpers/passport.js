var passport = require('passport');
var LocalStrategy = require('passport-local');

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	User.findOne({ username: new RegExp(username, 'i') }, function(err, user){
		done(err, user);
	});
});

passport.use(new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	}, function(username, password, done){
		helperAuth.auth(username, password, function(err, userRes){
			if(userRes){
				done(null, userRes);
			} else {
				done(null, false);
			}
		});
	}
));
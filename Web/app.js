// Run app in development mode by default

if(!process.env.NODE_ENV){
	process.env.NODE_ENV = 'development';
}

console.log('✓ Running application: ' + process.env.NODE_ENV);

// Main modules for the application

var express = require('express');
var http = require('http');
var path = require('path');
var sass = require('node-sass');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var expressValidator = require('express-validator');

// Auth

var passport = require('passport');
var MongoStore = require('connect-mongo')(session);

// Access application through app

//var db = require(path.join(__dirname, '/models/db.js'));
var app = express();

// Configure server

app.disable('x-powered-by');
app.set('port', process.env.PORT || 1337);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());
app.use(bodyParser());
app.use(expressValidator());
app.use(cookieParser());
app.use(session({ 
	secret: '!@@]|&c1YyuzD~1G)I/5){HJTvxN|PFIY#%:4@oeJvOv<&22)}5m;L7jG=c8GNq',
	store: new MongoStore({
		db: 'herro',
		clear_interval: 60
	}),
	cookie: {
		maxAge: 1209600 * 1000
	}
}));
app.use(passport.initialize());
app.use(passport.session());

// These things will be run at all views

app.use(function(req, res, next){
	if(req.isAuthenticated()){
		// Pass user object to all views
		res.locals.user = req.user;
	} else {
		res.locals.user = null;
		next();
	}
});

if(process.env.NODE_ENV === 'development'){
	// Display all kinds of logs for development mode

	console.log('✓ Loaded log modules');

	var morgan = require('morgan');
	var prettyError = require('pretty-error');
	prettyError.start();
	app.use(morgan('dev'));
}

require(path.join(__dirname, '/routes/list'))(app); // Pass "app" to test route

// If no matching route was found, give 'em the 404

app.use(function(req, res, next){
	res.send(404, '404');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('✓ Started at port ' + app.get('port'));
});
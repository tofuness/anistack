// ?: Load environment variables

var dotenv = require('dotenv');
dotenv.load();

console.log('✓ Running application: ' + process.env.NODE_ENV);

// Main modules for the application

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var expressValidator = require('express-validator');

// Auth

var passport = require('passport');
var MongoStore = require('connect-mongo')(session);

// Access application through app

var app = express();

// Configure server

app.disable('x-powered-by');
app.set('port', process.env.PORT || 1337);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({ 
	secret: process.env.SESSION_SECRET,
	store: new MongoStore({
		db: 'herro',
		clear_interval: 60
	}),
	cookie: {
		maxAge: 1209600 * 1000
	},
	resave: true,
	saveUninitialized: true
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
	app.use(morgan('dev'));
}
if(process.env.NODE_ENV === 'production'){
	console.log('✓ Loaded Sentry Log')
	var raven = require('raven');
	app.use(raven.middleware.express(process.env.SENTRY_URL));
}

require(path.join(__dirname, '/routes/list'))(app); // Pass "app" to test route

app.use(function(err, req, res, next){
	if(err) return next();
	console.log(err);
	res.status(500).end(err);
});

// If no matching route was found, give 'em the 404

app.use(function(req, res, next){
	res.status(404).send('404');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('✓ Started at port ' + app.get('port'));
});
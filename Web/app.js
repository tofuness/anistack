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
var passportLocal = require('passport-local');
var MongoStore = require('connect-mongo')(session);

// Access application through app

var app = express();

// Configure http.ServerResponse(req);

app.disable('x-powered-by');
app.set('port', process.env.PORT);
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
	name: 'nothingimportant.pls.don.hijack',
	secret: process.env.SESSION_SECRET,
	store: new MongoStore({
		db: 'herro_dev',
		clear_interval: 60 // One minute
	}),
	cookie: {
		maxAge: 1000 * 2630000 * 4 // 4 months
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
		console.log(req.user.username);
		res.locals.user = req.user;
	} else {
		res.locals.user = null;
		next();
	}
});

if(process.env.NODE_ENV === 'development'){
	// Display all kinds of logs for development mode
	console.log('✓ Loaded morgan module');
	var morgan = require('morgan');
	app.use(morgan('dev'));

	process.send({ cmd: 'NODE_DEV', required: './views/partials/header.hbs' });
	process.send({ cmd: 'NODE_DEV', required: './views/partials/footer.hbs' });
	process.send({ cmd: 'NODE_DEV', required: './views/login.hbs' });
	process.send({ cmd: 'NODE_DEV', required: './views/list.hbs' });
	process.send({ cmd: 'NODE_DEV', required: './views/search.hbs' });
}
if(process.env.NODE_ENV === 'production'){
	console.log('✓ Enabled trust proxy. Now accepting X-Forwarded-* headers.');
	app.enable('trust proxy');
}

// Helpers

require(path.join(__dirname, '/helpers/hbs'));

// Authentication

require(path.join(__dirname, '/helpers/passport'));
app.route('login')
.post(passport.authenticate('local', {
	successRedirect: '/list/anime',
	failureRedirect: '/login',
	failureFlash: true
}));

// Routes

require(path.join(__dirname, '/routes/list'))(app);
require(path.join(__dirname, '/routes/logreg'))(app);

app.use(function(err, req, res, next){
	if(err){
		// Do error handling
		console.log(err);
		res.status(500).json({ message: err.message, status: "error" });
	} else {
		next();
	}
});

// If no matching route was found, give 'em the 404

app.use(function(req, res, next){
	res.status(404).send('404');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('✓ Started at port ' + app.get('port'));
});
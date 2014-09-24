// Load process variables

var dotenv = require('dotenv');
dotenv.load();

// Main application modules

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var morgan = require('morgan');
var cors = require('cors');

// Authentication modules

var passport = require('passport');
var passportLocal = require('passport-local');
var MongoStore = require('connect-mongo')(session);

// Express configuration

var app = express();
var apiRouter = express.Router();

app.disable('x-powered-by');

// Set application port

app.set('port', process.env.APP_PORT || 1337);

// Set views directory

app.set('views', path.join(__dirname, 'views'));

// Set view engine

app.set('view engine', 'hbs');

// Set public directory (static assets)

app.use(express.static(path.join(__dirname, 'public')));

// Enable POS/GET/PUT/DELETE methods

app.use(methodOverride());

// Accept JSON data

app.use(bodyParser.json());

// Accept url encoded data

app.use(bodyParser.urlencoded({
	extended: true
}));

// Parse cookies and populate req.cookies with them

app.use(cookieParser());

// Set up session storage

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

// Enable flashes

app.use(flash());

// Initialize authentication module (passport)

app.use(passport.initialize());
app.use(passport.session());

// Enable logging

app.use(morgan('dev'));

if(process.env.NODE_ENV === 'development'){
	process.send({ cmd: 'NODE_DEV', required: './views/partials/header.hbs' });
	process.send({ cmd: 'NODE_DEV', required: './views/partials/footer.hbs' });
	process.send({ cmd: 'NODE_DEV', required: './views/login.hbs' });
	process.send({ cmd: 'NODE_DEV', required: './views/list.hbs' });
	process.send({ cmd: 'NODE_DEV', required: './views/search.hbs' });
}

// Production settings

if(process.env.NODE_ENV === 'production'){
	console.log('✓ Enabled trust proxy. Now accepting X-Forwarded-* headers.');
	app.enable('trust proxy');
}

// Populate res.locals.user with user information if logged in

app.use(function(req, res, next){
	if(req.isAuthenticated()){
		res.locals.user = req.user
	} else {
		res.locals.user = null;
	}
	next();
});

// Run helpers

require('./helpers/hbs');
require('./helpers/passport');

// Web routes

require('./routes/web/list.js')(app);
require('./routes/web/search.js')(app);
require('./routes/web/logreg.js')(app);

// API routes

app.use('/api', cors()); // Enable cors on all /api/* routes
app.use('/api', apiRouter); // Prepends /api/* to all routes
require('./routes/api/list.js')(apiRouter);
require('./routes/api/series.js')(apiRouter);
require('./routes/api/user.js')(apiRouter);

// Basic error handling

app.use(function(err, req, res, next){
	if(err){
		console.log(req.url);
		console.log(err.stack);
		res.status(500).json({ status: 'error', message: err.message });
	} else {
		next();
	}
});

// If none of the routes are matched, give 'em the 404

app.use(function(req, res, next){
	res.status(404).send('404 - Page not found');
});

// Create application server

http.createServer(app).listen(app.get('port'), function(){
	console.log('✓ Running application in: ' + process.env.NODE_ENV);
	console.log('✓ Application up and running at port: ' + app.get('port'));
});

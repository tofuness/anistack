// ?: Load environment variables

console.log('✓ Running application: ' + process.env.NODE_ENV);

// Main modules for the application

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Access application through app

var app = express();

// Configure server

app.disable('x-powered-by');
app.set('port', process.env.PORT || 1338);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

if(process.env.NODE_ENV === 'development'){
	// Display all kinds of logs for development mode
	console.log('✓ Loaded log modules');
	var morgan = require('morgan');
	app.use(morgan('dev'));
}

app.use(function(req, res, next){
	res.locals.version = '0.0.1-alpha';
	next();
});

require(path.join(__dirname, '/routes/index'))(app);

// If no matching route was found, give 'em the 404

app.use(function(req, res, next){
	res.status(404).send('404');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('✓ Started at port ' + app.get('port'));
});
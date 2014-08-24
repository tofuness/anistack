var http = require('http');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var raven = require('raven'); // https://getsentry.com/welcome/
var morgan = require('morgan'); // Normal logs
var _ = require('underscore');


var app = express();

app.disable('x-powered-by');
app.set('port', process.env.PORT || 1339);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

if(process.env.NODE_ENV === 'production'){
	console.log('✓ Loaded Sentry Log');
	app.use(raven.middleware.express(process.env.SENTRY_URL));
}

//app.use(morgan('dev'));

require(path.join(__dirname, '/routes/series'))(app);

app.use(function(err, req, res, next){
	if(err){
		// Do error handling
	}
	next();
});

app.use(function(req, res, next){
	res.status(404).end('404 - No such API');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('✓ API started at port ' + app.get('port'));
});
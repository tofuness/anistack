var http = require('http');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require('morgan'); // Normal logs

var app = express();
var router = express.Router();

app.disable('x-powered-by');
app.set('port', process.env.PORT);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Logging

app.use(morgan('dev'));

if(process.env.NODE_ENV === 'production'){
	// Stuff for production things
}

app.use('/api', router);
require(path.join(__dirname, '/routes/series'))(router);
require(path.join(__dirname, '/routes/list'))(router);
require(path.join(__dirname, '/routes/user'))(router);

app.use(function(err, req, res, next){
	if(err){
		console.log(err.stack);
		res.status(500).json({ message: err.message, status: "error" });
	} else {
		next();
	}
});

app.use(function(req, res, next){
	res.status(404).end('404 - No such API');
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('✓ Running API: ' + process.env.NODE_ENV);
	console.log('✓ API started at port ' + app.get('port'));
});
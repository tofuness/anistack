module.exports = function(app){
	app.get('/', function(req, res, next){
		res.send(200, 'HELLO MANG');
	});

	app.get('/test', function(req, res, next){
		res.send(200, 'HELLO AGAIN');
	});
}
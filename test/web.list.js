var app = require('../app');
var request = require('supertest');

describe('routes/web/list', function(){
	describe('GET /list/anime/mochi', function(){
		it('should respond with user anime list', function(done){
			request(app)
			.get('/list/anime/mochi')
			.expect(200, done);
		});
	});

	describe('GET /list/manga/mochi', function(){
		it('should respond with user manga list', function(done){
			request(app)
			.get('/list/manga/mochi')
			.expect(200, done);
		});
	});
});
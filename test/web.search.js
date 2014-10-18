var app = require('../app');
var request = require('supertest');

describe('routes/web/search', function(){
	describe('GET /search/anime', function(){
		it('should respond with anime search page', function(done){
			request(app)
			.get('/search/anime')
			.expect(200, done);
		});
	});
	describe('GET /search/manga', function(){
		it('should respond with manga search page', function(done){
			request(app)
			.get('/search/manga')
			.expect(200, done);
		});
	});
});
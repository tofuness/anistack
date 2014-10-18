var app = require('../app');
var request = require('supertest');

describe('routes/web/logreg', function(){
	describe('GET /login', function(){
		it('should respond with 200', function(done){
			request(app)
			.get('/login')
			.expect(200, done)
		});
	});

	describe('GET /register', function(){
		it('should respond with 200', function(done){
			request(app)
			.get('/register')
			.expect(200, done)
		});
	});

	describe('GET /register', function(){
		it('should redirect', function(done){
			request(app)
			.get('/logout')
			.expect(302, done)
		});
	});
});
var app = require('../app');
var request = require('supertest');

describe('GET /not-a-valid-page', function(){
	it('should respond with 404', function(done){
		request(app)
		.get('/not-a-valid-page')
		.expect(404, done);
	});
});
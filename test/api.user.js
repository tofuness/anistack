var app = require('../app');
var request = require('supertest');
var async = require('async');
var should = require('should');

var db = require('../models/db');
var User = db.User;
var Anime = db.Anime;
var Manga = db.Manga;

describe('routes/api/user', function(){
	beforeEach(function(done){
		User.remove({}, function(err){
			if(err) return done(err);
			var userDummy = new User(require('./fixtures/user'));
			userDummy.save(done);
		});
	});

	describe('POST /validate/email', function(){
		it('should respond with OK for new, valid email', function(done){
			request(app)
			.post('/api/validate/email')
			.send({
				email: 'uniquenewemail@gmail.com'
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				res.body.is_valid.should.equal(true);
				res.body.exists.should.equal(false);
				done();
			});
		});

		it('should respond with "is_valid: false" for invalid email', function(done){
			request(app)
			.post('/api/validate/email')
			.send({
				email: 'this-is-NOT-an-email@topofallkeks.io'
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				res.body.is_valid.should.equal(false);
				done();
			});
		});

		it('should respond with "exists: false" for existing email', function(done){
			request(app)
			.post('/api/validate/email')
			.send({
				email: 'adennisjin@gmail.com'
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				res.body.exists.should.equal(true);
				done();
			});
		});
	});

	describe('POST /validate/username', function(){
		it('should respond with OK for new, valid username', function(done){
			request(app)
			.post('/api/validate/username')
			.send({
				username: 'uniqueusername'
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				res.body.is_valid.should.equal(true);
				res.body.exists.should.equal(false);
				done();
			});
		});

		it('should respond with "exists: true" for existing username', function(done){
			request(app)
			.post('/api/validate/username')
			.send({
				username: 'mochi'
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				res.body.is_valid.should.equal(true);
				res.body.exists.should.equal(true);
				done();
			});
		});

		it('should respond with "is_valid: false" for too short username', function(done){
			request(app)
			.post('/api/validate/username')
			.send({
				username: 'ke'
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				res.body.is_valid.should.equal(false);
				done();
			});
		});

		it('should respond with "is_valid: false" for too long username', function(done){
			request(app)
			.post('/api/validate/username')
			.send({
				username: '00000000000000000000000000000000000000001'
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				res.body.is_valid.should.equal(false);
				done();
			});
		});

		it('should respond with "is_valid: false" for invalid username chars', function(done){
			request(app)
			.post('/api/validate/username')
			.send({
				username: 'e.g.no_underscores'
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				res.body.is_valid.should.equal(false);
				done();
			});
		});
	});
});
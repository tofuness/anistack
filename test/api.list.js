var app = require('../app');
var request = require('supertest');
var async = require('async');
var should = require('should');

var db = require('../models/db');
var User = db.User;
var Anime = db.Anime;
var Manga = db.Manga;

describe('routes/api/list', function(){
	before(function(done){
		async.parallel([
			function(callback){
				Anime.remove({}, function(err){
					callback(err);
				});
			},
			function(callback){
				Manga.remove({}, function(err){
					callback(err);
				});
			}
		], function(err, res){
			done(err);
		});
	});

	before(function(done){
		var animeDummy = new Anime(require('./fixtures/anime'));
		animeDummy.save(done);
	});

	before(function(done){
		var mangaDummy = new Manga(require('./fixtures/manga'));
		mangaDummy.save(done);
	});

	// Reset user document for each 

	beforeEach(function(done){
		User.remove({}, function(err){
			if(err) return done(err);
			var userDummy = new User(require('./fixtures/user'));
			userDummy.save(done);
		});
	});

	describe('GET /api/list/anime/view/:username', function(){
		it('should respond with user anime list in JSON', function(done){
			request(app)
			.get('/api/list/anime/view/mochi')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200, done);
		});
	});

	describe('POST /api/list/anime/add', function(){
		it('should add anime to list', function(done){
			request(app)
			.post('/api/list/anime/add')
			.send({
				username: 'mochi',
				api_token: 'topkek',
				_id: '53f9be32238fb5841beabb72', // Sword Art Online
				item_status: 'completed',
				item_rating: 4,
				item_progress: 25
			})
			.expect(200, done);
		});

		it('should redirect to login page', function(done){
			request(app)
			.post('/api/list/anime/add')
			.expect(302, done);
		});
	});

	describe('POST /api/list/anime/update', function(){
		it('should update anime in list', function(done){
			request(app)
			.post('/api/list/anime/add')
			.send({
				username: 'mochi',
				api_token: 'topkek',
				_id: '53f9be32238fb5841beabb72', // Sword Art Online
				item_status: 'completed',
				item_rating: 4,
				item_progress: 25
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				request(app)
				.post('/api/list/anime/update')
				.send({
					username: 'mochi',
					api_token: 'topkek',
					_id: '53f9be32238fb5841beabb72', // Sword Art Online
					item_status: 'planned',
					item_progress: 20
				})
				.expect(200, done);
			});
		});

		it('should redirect to login page', function(done){
			request(app)
			.post('/api/list/anime/update')
			.expect(302, done);
		});
	});

	describe('POST /api/list/anime/remove', function(){
		it('should remove anime from list', function(done){
			request(app)
			.post('/api/list/anime/add')
			.send({
				username: 'mochi',
				api_token: 'topkek',
				_id: '53f9be32238fb5841beabb72', // Sword Art Online
				item_status: 'completed',
				item_rating: 4,
				item_progress: 25
			})
			.expect(200, function(err, res){
				if(err) return done(err);
				request(app)
				.post('/api/list/anime/remove')
				.send({
					username: 'mochi',
					api_token: 'topkek',
					_id: '53f9be32238fb5841beabb72' // Sword Art Online
				})
				.expect(200, done);
			});
		});

		it('should redirect to login page', function(done){
			request(app)
			.post('/api/list/anime/remove')
			.expect(302, done);
		});
	});
});
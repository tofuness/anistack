var hAuth = require('../helpers/auth');
var listValidate = require('../helpers/validateListData');
var async = require('async');

var db = require('../models/db');
var User = db.User;
var Anime = db.Anime;
var Manga = db.Manga;

describe('helpers/auth', function(){
	beforeEach(function(done){
		User.remove({}, function(err){
			if(err) return done(err);
			var userDummy = new User(require('./fixtures/user'));
			userDummy.save(done);
		});
	});

	describe('ifAnyAuth', function(){
		it('should callback on successful token auth', function(done){
			var req = {
				body: {
					username: 'mochi',
					api_token: 'topkek'
				}
			}
			hAuth.ifAnyAuth(req, null, function(err){
				if(err) return done(err);
				done();
			});
		});

		it('should return error for invalid token auth', function(done){
			var req = {
				body: {
					username: 'not-valid-username',
					api_token: 'not-valid-token'
				}
			}
			hAuth.ifAnyAuth(req, null, function(err){
				if(err) return done();
			});
		});
	});
});

describe('helpers/validateListData', function(){
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

	describe('validate.anime', function(){
		it('should return the same object', function(done){
			var listAnimeObj = {
				_id: '53f9be32238fb5841beabb72',
				item_progress: 25,
				item_status: 'completed'
			};

			listValidate.anime(listAnimeObj, function(err, resAnimeObj){
				if(err) return done(err);
				resAnimeObj.should.equal(listAnimeObj);
				done();
			});
		});

		it('should return with *completed* progress', function(done){
			var listAnimeObj = {
				_id: '53f9be32238fb5841beabb72',
				item_progress: 3,
				item_status: 'completed'
			};

			listValidate.anime(listAnimeObj, function(err, resAnimeObj){
				if(err) return done(err);
				resAnimeObj.should.have.property('item_progress', 25);
				done();
			});
		});

		it('should return with *completed* status', function(done){
			var listAnimeObj = {
				_id: '53f9be32238fb5841beabb72',
				item_progress: 25,
				item_status: 'planned'
			};

			listValidate.anime(listAnimeObj, function(err, resAnimeObj){
				if(err) return done(err);
				resAnimeObj.should.have.property('item_status', 'completed');
				done();
			});
		});

		it('should return error, not found', function(done){
			var listAnimeObj = {
				_id: 'not-an-valid-id',
				item_progress: 25,
				item_status: 'planned'
			};

			listValidate.anime(listAnimeObj, function(err, resAnimeObj){
				if(err) return done();
			});
		});
	});

	describe('validate.manga', function(){
		it('should return the same object', function(done){
			var listMangaObj = {
				_id: '5434ff296a2ff84c2391b156',
				item_progress: 20,
				item_status: 'current'
			}
			listValidate.manga(listMangaObj, function(err, resMangaDoc){
				if(err) return done(err);
				resMangaDoc.should.equal(listMangaObj);
				done();
			});
		});

		it('should return error, not found', function(done){
			var listMangaObj = {
				_id: 'no-valid-id',
				item_progress: 20,
				item_status: 'current'
			}
			listValidate.manga(listMangaObj, function(err, resMangaDoc){
				if(err) return done();
			});
		});
	});
});

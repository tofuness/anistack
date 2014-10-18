var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var slugin = require('slugin');
var bcryptjs = require('bcryptjs');
var _ = require('lodash');
var request = require('request');

var mongooseValidateFilter = require('mongoose-validatefilter');
if(process.env.NODE_ENV !== 'test'){
	mongoose.connect('mongodb://localhost:27017/herro_dev');
} else {
	mongoose.connect('mongodb://localhost:27017/herro_test');
}

var validators = {
	anime: new mongooseValidateFilter.validate(),
	manga: new mongooseValidateFilter.validate(),
	user: new mongooseValidateFilter.validate(),
	list: new mongooseValidateFilter.validate()
}

var filters = {
	anime: new mongooseValidateFilter.filter(),
	manga: new mongooseValidateFilter.filter(),
	user: new mongooseValidateFilter.filter(),
	list: new mongooseValidateFilter.filter()
}

var filter = {
	anime: {
		allowedGenres: [
			'action', 'adventure', 'comedy',
			'demons', 'drama', 'ecchi',
			'fantasy', 'game', 'harem',
			'hentai', 'historical', 'horror',
			'josei', 'kids', 'magic',
			'martial arts', 'mecha', 'military',
			'music', 'mystery', 'parody',
			'police', 'psychological', 'romance',
			'samurai', 'school', 'sci-fi',
			'seinen', 'shoujo', 'shoujo ai',
			'shounen', 'shounen ai', 'slice of life',
			'space', 'sports', 'super power',
			'supernatural', 'thriller', 'campire',
			'yaoi', 'yuri'
		],
		date: function(dateString, done){
			if(Date.parse(dateString) !== 0){
				done(dateString);
			} else {
				done(null);
			}
		},
		genres: function(genreArr, done){
			done(_.intersection(genreArr, filter.anime.allowedGenres));
		}
	},
	user: {
		password: function(passwordStr, done){
			bcryptjs.hash(passwordStr, 8, function(err, hash){
				if(err) throw new Error('bcrypt hash failed');
				return done(hash);
			});
		}
	},
	general: {
		lowerCaseUniq: function(arr, done){
			if(arr.length){
				arr = _.uniq(arr.map(function(item){
					return item.toLowerCase();
				}));
				done(arr);
			} else {
				done([]);
			}
		}
	}
}

var validate = {
	anime: {
		type: function(typeStr, done){
			typeStr = typeStr.toLowerCase();
			if(['tv', 'ova', 'ona', 'movie', 'special', 'music'].indexOf(typeStr) > -1){
				done(true);
			} else {
				done(false);
			}
		}
	},
	manga: {
		type: function(typeStr, done){
			typeStr = typeStr.toLowerCase();
			if(['manga', 'novel', 'oneshot', 'doujin', 'manhwa', 'manhua', 'oel'].indexOf(typeStr) > -1){
				done(true);
			} else {
				done(false);
			}	
		}
	},
	user: {
		username: function(usernameStr, done){
			if(/^\w+$/g.test(usernameStr)) return done(false); // ?: Check if username only includes letters/numbers
			this.findOne({
				username: new RegExp('^' + usernameStr + '$', 'i')
			}, function(err, doc){
				if(err) return done(false);
				return done(!doc);
			});
		},
		email: function(emailStr, done){
			if(emailStr === undefined) return done(true);
			// ?: This validation method also exists in /routes/user.js. Not very DRY, but still acceptable
			request('https://api.mailgun.net/v2/address/validate?api_key=' + process.env.MAILGUN_PUBKEY + '&address=' + emailStr, function(err, response, body){
				body = JSON.parse(body);
				if(!body.is_valid) return done(false);
				this.findOne({
					email: emailStr.toLowerCase()
				}, function(err, userDoc){
					if(err) return done(false);
					return done(!userDoc);
				});
			}.bind(this));
		}
	},
	list: {
		anime: function(_animeId, done){
			console.log(animeId);
			done(false);
		},
		status: function(statusStr){
			statusStr = statusStr.toLowerCase();
			if(['current', 'completed', 'planned', 'onhold', 'dropped'].indexOf(statusStr) > -1){
				done(true);
			} else {
				done(false);
			}
		}
	}
}

// Validation/Filtering for AnimeSchema

validators.anime.add('series_type', {
	callback: validate.anime.type,
	msg: 'series_type did not pass validation'
});

validators.anime.add('series_episodes_total', {
	min: 0,
	max: 999,
	msg: 'series_episodes_total did not pass validation'
});

filters.anime.add('series_type', 'lowercase');
filters.anime.add('series_genres', filter.general.lowerCaseUniq);
filters.anime.add('series_genres', filter.anime.genres);

// Validation/Filtering for MangaSchema

validators.manga.add('series_type', {
	callback: validate.manga.type,
	msg: 'series_type did not pass validation'
});

filters.manga.add('series_type', 'lowercase');
filters.manga.add('series_genres', filter.general.lowerCaseUniq);
filters.manga.add('series_genres', filter.anime.genres);

// Validation/Filtering for UserSchema

validators.user.add('display_name', {
	minLength: 3,
	maxLength: 40,
	msg: 'display_name did not pass validation'
});

validators.user.add('username', {
	minLength: 3,
	maxLength: 40,
	callback: validate.user.username,
	msg: 'username did not pass validation'
});

validators.user.add('password', {
	minLength: 6,
	msg: 'password did not pass validation'
});

validators.user.add('email', {
	callback: validate.user.email,
	msg: 'email did not pass validation'
});

filters.user.add('username', 'lowercase');
filters.user.add('email', 'lowercase');
filters.user.add('password', filter.user.password);

// Schemas

var AnimeSchema = new Schema({
	series_title_main: { // Straight from Wikipedia
		type: String,
		required: true
	},
	series_title_english: String,
	series_title_japanese: String,
	series_title_romanji: String,
	series_title_synonyms: [ String ], // Abbriviations should be added as "tags"
	series_slug: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	series_type: {
		type: String,
		lowercase: true,
		enum: ['tv', 'ova', 'ona', 'movie', 'special', 'music'],
		required: true
	},
	series_date_start: Date,
	series_date_end: Date,
	series_description: String,
	series_episodes_total: {
		type: Number,
		min: 0,
		max: 9999,
		required: true
	},
	series_image_original: String,
	series_image_processed: String,
	series_image_reference: String,
	series_genres: [ String ],
	series_gallery: [ String ],
	series_studios: [ Schema.Types.ObjectId ],
	series_external_ids: {
		myanimelist: {
			type: Number,
			unique: true
		},
		anidb: Number
	},
	series_external_links: [{
		_id: false,
		title: String,
		url: String
	}]
});

AnimeSchema.plugin(slugin, {
	slugName: 'series_slug',
	source: [
		'series_title_main'
	]
});

var MangaSchema = new Schema({
	series_title_main: { // Straight from Wikipedia
		type: String,
		required: true
	},
	series_title_english: String,
	series_title_japanese: String,
	series_title_romanji: String,
	series_title_synonyms: [ String ], // Abbriviations should be added as "tags"
	series_slug: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	series_type: {
		type: String,
		lowercase: true,
		enum: ['manga', 'novel', 'oneshot', 'doujin', 'manhwa', 'manhua', 'oel'],
		required: true
	},
	series_date_start: Date,
	series_date_end: Date,
	series_description: String,
	series_image_original: String,
	series_image_processed: String,
	series_image_reference: String,
	series_genres: [ String ],
	series_gallery: [ String ],
	series_studios: [ Schema.Types.ObjectId ],
	series_external_ids: {
		myanimelist: {
			type: Number,
			unique: true
		},
		anidb: Number
	},
	series_external_links: [{
		_id: false,
		title: String,
		url: String
	}]
});

MangaSchema.plugin(slugin, {
	slugName: 'series_slug',
	source: [
		'series_title_main'
	]
});

var StudioSchema = new Schema({
	studio_title: {
		type: String,
		required: true
	},
	studio_image_original: String,
	studio_image_processed: String,
	studio_description: String,
	// ?: Does the "studio" actually do anime, or do they just license?
	studio_animates: Boolean
});

var AnimeListItemSchema = new Schema({
	_id: {
		type: Schema.Types.ObjectId,
		required: true
	},
	item_progress: {
		type: Number,
		min: 0,
		max: 9999,
		default: 0
	},
	item_rating: {
		type: Number,
		min: 0,
		max: 10,
		default: 0
	},
	item_status: {
		type: String,
		enum: ['current', 'completed', 'planned', 'onhold', 'dropped'],
		required: true
	},
	item_repeats: {
		type: Number,
		min: 0,
		max: 999,
		default: 0
	}
});

var MangaListItemSchema = new Schema({
	_id: {
		type: Schema.Types.ObjectId,
		required: true
	},
	item_progress: {
		type: Number,
		min: 0,
		max: 9999,
		default: 0
	},
	item_rating: {
		type: Number,
		min: 0,
		max: 10,
		default: 0
	},
	item_status: {
		type: String,
		enum: ['current', 'completed', 'planned', 'onhold', 'dropped'],
		required: true
	},
	item_repeats: {
		type: Number,
		min: 0,
		max: 999,
		default: 0
	}
});

var ActivityItemSchema = new Schema({
	// ?: Modified version of the ActivityStreams 2.0 Schema
	verb: {
		type: String,
		lowercase: true,
		required: true
	},
	published: {
		type: Date,
		default: Date.now
	},
	actor: {
		objectType: {
			type: String,
			required: true
		},
		_id: {
			type: Schema.Types.ObjectId,
			required: true
		},
		display_name: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		},
		image: String // ?: For user avatars
	},
	object: {
		objectType: {
			type: String,
			required: true
		},
		_id: {
			type: Schema.Types.ObjectId,
			required: true
		},
		display_name: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		}
	},
	target: {
		objectType: {
			type: String,
			required: true
		},
		_id: {
			type: Schema.Types.ObjectId,
			required: true
		},
		display_name: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		}
	}
});

var UserSchema = new Schema({
	display_name: {
		type: String,
		required: true,
		unique: true
	},
	// Username should always be lowercase
	username: {
		type: String,
		required: true,
		lowercase: true,
		unique: true
	},
	email: {
		type: String,
		lowercase: true,
		unique: true
	},
	avatar: {
		processed: String,
		original: String
	},
	password: {
		type: String,
		required: true
	},
	biography: {
		type: String
	},
	settings: {
		stats_private: {
			type: Boolean,
			default: false
		},
		anime_list_private: {
			type: Boolean,
			default: false
		},
		manga_list_private: {
			type: Boolean,
			default: false
		},
		collections_private: {
			type: Boolean,
			default: false
		}
	},
	anime_list: [ AnimeListItemSchema ],
	manga_list: [ MangaListItemSchema ],
	activity_feed: [ ActivityItemSchema ],
	api_token: String
});

mongooseValidateFilter.validateFilter(AnimeSchema, validators.anime, filters.anime);
mongooseValidateFilter.validateFilter(MangaSchema, validators.manga, filters.manga);
mongooseValidateFilter.validateFilter(UserSchema, validators.user, filters.user);

var Anime = mongoose.model('Anime', AnimeSchema);
var Manga = mongoose.model('Manga', MangaSchema);
var User = mongoose.model('User', UserSchema);

module.exports = {
	Anime: Anime,
	Manga: Manga,
	User: User
}
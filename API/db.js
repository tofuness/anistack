var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var slugin = require('slugin');
var _ = require('underscore');

var mongooseValidateFilter = require('mongoose-validatefilter');
mongoose.connect('mongodb://localhost:27017/herro_dev');

var validators = {
	anime: new mongooseValidateFilter.validate(),
	user: new mongooseValidateFilter.validate()
}
var filters = {
	anime: new mongooseValidateFilter.filter(),
	user: new mongooseValidateFilter.filter()
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
		type: function(typeString, done){
			typeString = typeString.toLowerCase();
			if(['tv', 'ova', 'ona', 'movie', 'special', 'music'].indexOf(typeString) > -1){
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
	max: 9999,
	msg: 'series_episodes_total did not pass validation'
});

filters.anime.add('series_type', 'lowercase');
filters.anime.add('series_genres', filter.general.lowerCaseUniq);
filters.anime.add('series_genres', filter.anime.genres);

// Validation/Filtering for UserSchema

validators.user.add('email', {
	type: 'email',
	minLength: 5,
	maxLength: 80,
	msg: 'email did not pass validation'
});

filters.user.add('email', 'lowercase');


var AnimeSchema = new Schema({
	series_title_main: { // Straight from Wikipedia
		type: String,
		required: true,
		unique: true
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
		myanimelist: Number,
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

var StudioSchema = new Schema({
	studio_title: {
		type: String,
		required: true
	},
	studio_image_original: String,
	studio_image_processed: String,
	studio_description: String,
	// ?: Does the "studio" actually do anime, or do they just license?
	studio_animates: {
		type: Boolean,
		required: true
	}
});

var AnimeListItemSchema = new Schema({
	_id: {
		// ?: Anime or Manga _id
		type: Schema.Types.ObjectId,
		required: true
	},
	_anime: Schema.Types.ObjectId,
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
		required: true
	}
});

var MangaListItemSchema = new Schema({
	_id: {
		// ?: Anime or Manga _id
		type: Schema.Types.ObjectId,
		required: true
	},
	_manga: Schema.Types.ObjectId,
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
		required: true
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
	username: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		lowercase: true,
		required: true,
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
	anime_list: [ AnimeListItemSchema ],
	manga_list: [ MangaListItemSchema ],
	activity_feed: [ ActivityItemSchema ]
});

mongooseValidateFilter.validateFilter(AnimeSchema, validators.anime, filters.anime);
mongooseValidateFilter.validateFilter(UserSchema, validators.user, filters.user);

module.exports = {
	Anime: mongoose.model('Anime', AnimeSchema),
	User: mongoose.model('User', UserSchema),
	Schema: {
		Anime: AnimeSchema
	}
}
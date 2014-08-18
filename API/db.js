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
		date: function(dateString, done){
			if(dateString.length > 8){ // We don't want some random shit
				done(dateString);
			} else {
				done(null);
			}
		},
		genres: function(genresArr, done){
			if(genresArr.length){
				genresArr = _.uniq(genresArr.map(function(genre){
					return genre.toLowerCase();
				}));
				done(genresArr);
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

filters.anime.add('series_type', 'lowercase');
filters.anime.add('series_genres', filter.anime.genres);
filters.anime.add('series_date_start', filter.anime.date);
filters.anime.add('series_date_end', filter.anime.date);

// Validation/Filtering for UserSchema

validators.user.add('email', {
	type: 'email',
	minLength: 5,
	maxLength: 80
});
filters.user.add('email', 'lowercase');


var AnimeSchema = new Schema({
	series_title_english: {
		type: String
	},
	series_title_japanese: {
		type: String
	},
	series_title_romanji: {
		type: String
	},
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
	series_date_start: {
		type: Date
	},
	series_date_end: {
		type: Date
	},
	series_synopsis: {
		type: String
	},
	series_episodes_total: {
		type: Number,
		min: 0,
		max: 9999,
		required: true
	},
	series_image_original: {
		type: String
	},
	series_image_processed: {
		type: String
	},
	series_gallery: [ String ],
	series_genres: [{
		type: String,
		lowercase: true
	}],
	series_external_links: [ String ]
});

AnimeSchema.plugin(slugin, {
	slugName: 'series_slug',
	source: [
		'series_title_english',
		'series_title_romanji'
	]
});

var ListItemSchema = new Schema({
	_id: {
		// ?: Anime or Manga _id
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
	anime_list: [ ListItemSchema ],
	manga_list: [ ListItemSchema ],
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
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/herro_dev');

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
		required: true
	},
	series_image_original: {
		type: String
	},
	series_image_processed: {
		type: String
	},
	series_gallery: [ String ],
	series_genres: [ String ],
	series_external_links: [ String ]
});

var ListItemSchema = new Schema({
	_id: {
		// ?: Anime or Manga _id
		type: Schema.Types.ObjectId,
		required: true
	},
	item_progress: {
		type: Number,
		default: 0
	},
	item_rating: {
		type: Number,
		default: 0
	},
	item_status: {
		type: Number,
		required: true
	}
});

var ActivityItemSchema = new Schema({
	// ?: Modified version of the ActivityStreams 2.0 Schema
	verb: {
		type: String,
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
})

module.exports = {
	Anime: mongoose.model('Anime', AnimeSchema),
	User: mongoose.model('User', UserSchema),
	Schema: {
		Anime: AnimeSchema
	}
}
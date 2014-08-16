var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/herro_dev');

var AnimeSchema = new Schema({
	series_title_english: {
		type: String,
		required: true,
		unique: true
	},
	series_title_japanese: {
		type: String
	},
	series_title_romanji: {
		type: String
	},
	series_type: {
		type: Number,
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
	series_image: {
		processed: String,
		original: String
	},
	series_genres: [ String ],
	series_external_links: [ String ]
});

var ListItemSchema = new Schema({
	_id: {
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
})

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
	manga_list: [ ListItemSchema ]
})

module.exports = {
	Anime: mongoose.model('Anime', AnimeSchema),
	User: mongoose.model('User', UserSchema)
}
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/herro_dev');

var AnimeSchema = new Schema({
	series_title_english: {
		type: String,
		default: '',
		required: true,
		unique: true
	},
	series_title_japanese: {
		type: String,
		default: ''
	},
	series_title_romanji: {
		type: String,
		default: ''
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
	series_episodes_total: {
		type: Number,
		required: true
	},
	series_image: {
		processed: {
			type: String
		},
		original: {
			type: String
		}
	},
	series_genres: [ String ],
	series_external_links: [{
		
		url: String,
	}]
});
var dotenv = require('dotenv');
dotenv._getKeysAndValuesFromEnvFilePath('../.env');
dotenv._setEnvs();

var async = require('async');
var request = require('request');
var _ = require('lodash');
var bar = require('progress-bar').create(process.stdout);

var db = require('../models/db.js');
var Anime = db.Anime;

var fs = require('fs');
//var errorLog = fs.WriteStream('./logs/updateAnime-' + new Date().getTime() + '.log');

var getQ = async.queue(function(task, callback) {
	request(task.url, function(err, res, body) {
		if (err || res.statusCode === 404) {
			console.log('404 at %s', task.url);
			return callback();
		}

		animeJSON = JSON.parse(body);
		console.log(animeJSON.name);
		var anime = {
			series_title_main: animeJSON.name,
			series_title_english: animeJSON.english[0],
			series_title_japanese: animeJSON.japanese[0],
			series_title_synonyms: animeJSON.synonyms,
			series_type: animeJSON.kind,
			series_date_start: animeJSON.aired_on,
			series_date_end: animeJSON.released_on,
			series_episodes_total: animeJSON.episodes,
			series_image_reference: 'http://shikimori.org' + animeJSON.image.original,
			series_genres: _.pluck(animeJSON.genres, 'name')
		}

		Anime.updateOne({
			'series_external_ids.myanimelist': task.id
		}, anime, function(err, doc) {
			if (err) {
				errorLog.write(err + '\n URL: ' + task.url + '\n\n');
				console.log('DB ERROR at %s', task.url);
				return callback();
			}
			console.log('Updated %s (%s)', anime.series_title_main, anime.series_type);
			return callback();
		});
	});
}, 1);

getQ.push({
	url: 'http://shikimori.org/api/animes/' + 23945,
	id: 23945
});
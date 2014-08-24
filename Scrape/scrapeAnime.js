var async = require('async');
var request = require('request');
var _ = require('underscore');
var bar = require('progress-bar').create(process.stdout);

var db = require('../API/db.js');
var Anime = db.Anime;

var fs = require('fs');
var errorLog = fs.WriteStream('./logs/' + new Date().getTime() + '.log');

var getQ = async.queue(function(task, callback){
	request(task.url, function(err, res, body){
		if(err || res.statusCode === 404){
			console.log('404 at %s', task.url);
			console.log('\n');
			bar.update(task.index / 26200);
			console.log('\n');
			return callback();
		}

		animeJSON = JSON.parse(body);

		var anime = new Anime({
			series_title_main: animeJSON.name,
			series_title_english: animeJSON.english[0],
			series_title_japanese: animeJSON.japanese[0],
			series_title_synonyms: animeJSON.synonyms,
			series_type: animeJSON.kind,
			series_date_start: animeJSON.aired_on,
			series_date_end: animeJSON.released_on,
			series_episodes_total: animeJSON.episodes,
			series_image_reference: 'http://shikimori.org' + animeJSON.image.original,
			series_genres: _.pluck(animeJSON.genres, 'name'),
			series_external_ids: {
				myanimelist: animeJSON.myanimelist_id
			}
		});

		console.log(anime);

		Anime.createOne(anime, function(err, doc){
			if(err){
				errorLog.write(err + '\n URL: ' + task.url + '\n\n');
				console.log('DB ERROR at %s', task.url);
				console.log('\n');
				bar.update(task.index / 26200);
				console.log('\n');
				return callback();
			}
			console.log('Added %s (%s)', anime.series_title_main, anime.series_type);
			console.log('\n');
			bar.update(task.index / 26200);
			console.log('\n');
			return callback();
		});
	});
}, 1);

getQ.push({
	url: 'http://shikimori.org/api/animes/11757',
	index: 11757
});

/*
for (var i = 4000, len = 26200; i < len; i++) {
	getQ.push({
		url: 'http://shikimori.org/api/animes/' + i,
		index: i
	});
} */
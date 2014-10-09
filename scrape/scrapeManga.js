var async = require('async');
var request = require('request');
var _ = require('lodash');
var bar = require('progress-bar').create(process.stdout);

var db = require('../models/db.js');
var Manga = db.Manga;

var fs = require('fs');
var errorLog = fs.WriteStream('./logs/manga-' + new Date().getTime() + '.log');

var getQ = async.queue(function(task, callback){
	request(task.url, function(err, res, body){
		if(err || res.statusCode === 404){
			console.log('404 at %s', task.url);
			console.log('\n');
			bar.update(task.index / 80931);
			console.log('\n');
			return callback();
		}

		mangaJSON = JSON.parse(body);

		var manga = new Manga({
			series_title_main: mangaJSON.name,
			series_title_english: mangaJSON.english[0],
			series_title_japanese: mangaJSON.japanese[0],
			series_title_synonyms: mangaJSON.synonyms,
			series_type: mangaJSON.kind.replace(/ /g, ''),
			series_date_start: mangaJSON.aired_on,
			series_date_end: mangaJSON.released_on,
			series_image_reference: 'http://shikimori.org' + mangaJSON.image.original,
			series_genres: _.pluck(mangaJSON.genres, 'name'),
			series_external_ids: {
				myanimelist: mangaJSON.myanimelist_id
			}
		});

		Manga.createOne(manga, function(err, doc){
			if(err){
				errorLog.write(err + '\n URL: ' + task.url + '\n\n');
				console.log('DB ERROR at %s', task.url);
				console.log('\n');
				bar.update(task.index / 80931);
				console.log('\n');
				return callback();
			}
			console.log('Added %s (%s)', manga.series_title_main, manga.series_type);
			console.log('\n');
			bar.update(task.index / 80931);
			console.log('\n');
			return callback();
		});
	});
}, 1);

for (var i = 56804, len = 80931; i < len; i++) {
	getQ.push({
		url: 'http://shikimori.org/api/mangas/' + i,
		index: i
	});
}
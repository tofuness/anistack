var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');

var db = require('../API/db.js');
var Anime = db.Anime;

var fs = require('fs');

var noMatchLog = fs.createWriteStream('./logs-step3/nomatch-' + Date.now() + '.log');
var error404 = fs.createWriteStream('./logs-step3/404-' + Date.now() + '.log');
var errorDBLog = fs.createWriteStream('./logs-step3/DB-' + Date.now() + '.log');

// Merges data from Shikimori and Wikipedia

var getQ = async.queue(function(task, callback){
	request('http://shikimori.org/api/animes/' + task.series_external_ids.myanimelist, function(err, res, body){
		var animeInfo = JSON.parse(body);
		if(animeInfo.kind === "TV"){
			Anime.updateOne({
				_id: task._id
			}, {
				series_genres: _.pluck(animeInfo.genres, 'name'),
				series_title_synonyms: animeInfo.synonyms
			}, function(err, doc){
				if(err) errorDBLog.write(err + '\n');
				console.log('Updated ' + task.series_title_main);
				callback();
			});
		} else {
			noMatchLog.write(task.series_title_main + '\n');
			callback();
		}
	});
}, 10);

Anime.find({ 'series_external_ids.myanimelist': { $exists: true }}, function(err, doc){
	if(err) return console.log(err);
	getQ.push(doc);
});
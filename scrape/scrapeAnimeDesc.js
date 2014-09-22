// Not very well writte code

var db = require('../models/db.js');
var Anime = db.Anime;
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var errorLog = fs.WriteStream('./logs/' + new Date().getTime() + '.log');

var getQ = async.queue(function(task, callback){
	request(task.url, function(err, res, body){
		if(err || res.statusCode === 404){
			console.log('404 at %s', task.url);
			errorLog.write(task.url + '\n');
			return callback();
		}
		$ = cheerio.load(body);
		$('#animeDes').find('h1').remove();
		var desc = $('#animeDes').text().trim();
		if(desc){
			console.log(task.url + ' OK');
			Anime.updateOne({
				'series_external_ids.myanimelist': task.id
			}, {
				series_description: desc
			}, function(err, res){
				if(!err && res){
					console.log('updated ' + task.id);
				}
				callback();
			});
		} else {
			console.log('NO DESC ' + task.url);
			callback();
		}
	});
}, 2);

Anime.find({}, function(err, res){
	if(err) return console.log(err);
	for(var i = 0; i < res.length; i++){
		if(!res[i].series_external_ids.myanimelist){
			console.log('no malid for ' + res[i].series_title_main);
			return false;
		}
		getQ.push({
			url: 'http://anilist.co/anime/' + res[i].series_external_ids.myanimelist,
			id: res[i].series_external_ids.myanimelist
		});
	}
});
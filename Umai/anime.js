var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');

var db = require('../API/db.js');
var Anime = db.Anime;

var fs = require('fs');
var logDBError = fs.createWriteStream('./logs/DB-' + Date.now() + '.log');
var logMultiple = fs.createWriteStream('./logs/multiple-' + Date.now() + '.log');
var logError = fs.createWriteStream('./logs/error-' + Date.now() + '.log');

var getQ = async.queue(function(task, callback){
	request('http://en.wikipedia.org' + task.url, function(err, res, body){
		if(err || res.statusCode !== 200){
			logError.write('404: ' + task.url + '\n\n');
			return callback();
		}

		var $ = cheerio.load(body);

		// If anime has more than 1 season, handle that by hand.

		if($('tr:contains(Anime television series)').length > 1){
			logMultiple.write(task.url + '\n');
			return callback();
		}

		// If anime doesn't have ... anime

		if($('tr:contains(Anime television series)').length === 0){
			logError.write('NO ANIME: ' + task.url + '\n\n');
			return callback();
		}

		var anime = {
			series_title_main: '',
			series_title_english: '',
			series_title_japanese: '',
			series_title_romanji: '',
			series_title_abbr: '',
			series_type: 'tv',
			series_date_start: '',
			series_date_end: '',
			series_episodes_total: 0,
			series_genres: [],
			series_studios: [],
			series_wiki_url: '',
			series_external_links: []
		}

		// Main title, the one at top

		anime.series_title_main = $('#firstHeading').text()
									.replace(/(\(anime\)|\(manga\))|\(visual novel\)|\(novel\)|\(novel series\)|\(light novel\)/, '')
									.trim();

		// Determine if there is an English title

		var engTitleInfo = $('#mw-content-text').find('>p span').eq(0).text();
		var engTitleLitIndex = engTitleInfo.indexOf('lit.');

		if(engTitleLitIndex > -1){
			anime.series_title_english = engTitleInfo.substr(engTitleLitIndex + 4).replace(/[\)]+/, '').replace(/\"/g, '').trim();
		} else {
			anime.series_title_english = anime.series_title_main ;
		}

		// Determine Japanese title

		var japTitleInfo = $('span[lang=ja] span').text();

		if(japTitleInfo !== ''){
			anime.series_title_japanese = japTitleInfo;
		} else {
			anime.series_title_japanese = $('.t_nihongo_kanji').first().text();
		}

		// Determine if there is a romanji title

		var romTitleInfo = $('#mw-content-text').find('>p span').eq(0).find('i').eq(0).text();

		if(romTitleInfo.toLowerCase() === anime.series_title_english.toLowerCase()){
			anime.series_title_romanji = anime.series_title_main;
		} else if(romTitleInfo !== ''){
			anime.series_title_romanji = romTitleInfo;
		}

		// Determine start and end date

		var dateInfo = $('tr:contains(Anime television series)').eq(0)
			.nextUntil('tr:has(td[colspan])').filter('tr:contains(Original run)')
			.find('td').text().split(' – ');

		var dateInfoParsed = dateInfo.map(function(animeDate){
			if(!isNaN(Date.parse(animeDate))){
				return new Date(animeDate);
			} else {
				return null;
			}
		});

		anime.series_date_start = dateInfoParsed[0];
		anime.series_date_end = dateInfoParsed[1];

		// Determina total episodes

		var episodeInfo = $('tr:contains(Anime television series)').eq(0)
			.nextUntil('tr:contains(Episodes)').last().next().find('td')
			.text().substr(0,3).replace(/\D/g, '');

		if(!isNaN(episodeInfo)){
			anime.series_episodes_total = episodeInfo;
		} else {
			logError.write('EPISODE ERROR: ' + task.url + '\n\n');
			return callback();
		}

		// Determine genres

		var genreInfo = $('tr:contains(Genre)').eq(0).find('td').text().split(',');

		if(genreInfo && genreInfo.length){
			anime.series_genres = genreInfo.map(function(genre){ return genre.replace(/\[[0-9]\]/, '').trim().toLowerCase(); });
		}

		// Determine Studios

		var studioInfo = $('tr:contains(Anime television series)').eq(0)
						.nextUntil('tr:has(td[colspan])')
						.filter('tr:contains(Studio)').find('td a');
		var studioInfoParsed = [];

		studioInfo.each(function(){
			studioInfoParsed.push({
				title: $(this).text(),
				url: $(this).attr('href')
			});
		});

		if(studioInfoParsed.length){
			anime.series_studios = studioInfoParsed;
		}

		// Add the wiki url for future fetching

		anime.series_wiki_url = task.url;

		// Determine all external links

		var extInfo = $('h2:has(>#External_links)').next('ul').find('a[rel="nofollow"]');
		var extInfoParsed = [];

		extInfo.each(function(){
			extInfoParsed.push({
				title: $(this).text(),
				url: $(this).attr('href')
			});
		});

		anime.series_external_links = extInfoParsed;

		saveQ.push(anime);
		callback();
	});
}, 10);

var saveQ = async.queue(function(animeInfo, callback){
	var tempAnimeItem = new Anime(animeInfo);
	tempAnimeItem.save(function(err, doc){
		if(err){
			console.log('ERROR: ' + animeInfo.series_title_main);
			logDBError.write(err + '\n' + animeInfo.series_wiki_url + '\n\n');
		} else {
			console.log('ADDED: ' + animeInfo.series_title_main);
		}
		callback();
	});
}, 10);

var wikiUrls = JSON.parse(fs.readFileSync('./data/union.json'));

for(var i = 0; i < wikiUrls.length; i++){
	getQ.push({
		url: wikiUrls[i]
	});
}
//http://sankaku.iqdb.org/?url=

var scraperjs = require('scraperjs');
var async = require('async');
var _ = require('underscore');

var db = require('../API/db.js');
var Anime = db.Anime;

scraperjs.DynamicScraper.create('http://sankaku.iqdb.org/?url=http://cdn.myanimelist.net/images/anime/11/62117.jpg')
.scrape(function(){
	return $('tbody:contains(Best match)').find('img').attr('src').split('/').pop();
}, function(imageName){
	console.log(imageName);
});
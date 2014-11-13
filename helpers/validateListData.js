'use strict';

var db = require('../models/db.js');
var Anime = db.Anime;
var Manga = db.Manga;

var validate = {
	anime: function(itemData, done) {
		if (!itemData._id) return done('no _id was provided', null);
		Anime.findOne({
			_id: itemData._id
		}, function(err, animeDoc) {
			if (animeDoc){

				// Make sure the status type, exists.
				if (['current', 'completed', 'planned', 'onhold', 'dropped'].indexOf(itemData.item_status) === -1) itemData.item_status = 'current';

				var episodesTotal = animeDoc.series_episodes_total;
				if (!episodesTotal) return done(null, itemData);

				if (itemData.item_progress === undefined) return done('no item_progress was provided', null);

				if (itemData.item_progress >= episodesTotal) {
					itemData.item_status = 'completed';
					itemData.item_progress = episodesTotal;
				}

				if (itemData.item_status === 'completed') {
					itemData.item_progress = episodesTotal;
				}

				done(null, itemData);
			} else {
				done('anime does not exist', null);
			}
		});
	},
	manga: function(itemData, done) {
		if (!itemData._id) return done('no _id was provided', null);
		if (['current', 'completed', 'planned', 'onhold', 'dropped'].indexOf(itemData.item_status) === -1) itemData.item_status = 'current';
		
		Manga.findOne({
			_id: itemData._id
		}, function(err, mangaDoc) {
			if (mangaDoc){
				done(null, itemData);
			} else {
				done('manga does not exists', null);
			}
		});
	}
}

module.exports = validate;
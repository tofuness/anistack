var db = require('../models/db.js');
var Anime = db.Anime;
var _ = require('lodash');

module.exports = {
	validate: {
		anime: function(itemData, done){
			if(!itemData._id) return done(true, null);
			Anime.findOne({
				_id: itemData._id
			}, function(err, animeDoc){
				if(animeDoc){
					var episodesTotal = animeDoc.series_episodes_total;
					if(episodesTotal && itemData.item_progress >= episodesTotal){
						itemData.item_status = 'completed';
						itemData.item_progress = episodesTotal;
					}
					if(episodesTotal && itemData.item_status === 'completed'){
						itemData.item_progress = episodesTotal;
					}

					done(null, itemData);
				} else {
					done(true, null);
				}
			});
		},
		manga: function(data, done){

		}
	}
}
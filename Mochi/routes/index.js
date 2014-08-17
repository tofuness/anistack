var db = require('../../API/db.js');

module.exports = function(app){
	app.route('/:collection(anime|manga)/add')
	.get(function(req, res, next){
		var collectionSchema;
		res.render('editor', { schemaType: req.param('collection') });
	});
}
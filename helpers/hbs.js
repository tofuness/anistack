var Swag = require('swag');
var hbs = require('hbs');
var fs = require('fs');

module.exports = function(partialsPath){
	if(!fs.existsSync(partialsPath)){
		throw new Error('No such path ' + partialsPath);
	}
	hbs.registerPartials(partialsPath, function(err){
		if(err) return new Error(err);
	});

	Swag.registerHelpers(hbs);
}
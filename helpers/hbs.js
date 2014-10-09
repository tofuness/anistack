var Swag = require('swag');
var hbs = require('hbs');

hbs.registerPartials('./views/partials', function(err){
	if(err) return console.log('✗ Could not load HBS partials: ' + err);
	if(process.env.NODE_ENV !== 'test'){
		console.log('✓ Loaded HBS partials');
	}
});

Swag.registerHelpers(hbs);
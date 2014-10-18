var should = require('should');

describe('helpers/hbs', function(){
	describe('registerPartials', function(){
		it('should load partials successfully', function(done){
			try {
				require('../helpers/hbs.js')('./views/partials');
			} finally {
				done();
			}
		});

		it('should fail to load partials', function(done){
			try {
				require('../helpers/hbs.js')('../ss/not_a_path_to_partials');
			} catch(err) {
				done();
			}
		});

	});
});
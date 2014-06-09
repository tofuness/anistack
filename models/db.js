var mongoose = require('mongoose');
var Schema = mongoose.Schema;

if(process.env.NODE_ENV === 'development'){
	mongoose.connect('mongodb://127.0.0.1:27017/herro_dev');
} else {
	mongoose.connect('mongodb://127.0.0.1:27017/herro');
}


// Change mongoose 
// Write db document schema here and export them
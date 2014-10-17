var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var react = require('gulp-react');
var cssmin = require('gulp-cssmin');

// Holy shit the deps.

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var reactify = require('reactify');
var uglify = require('gulp-uglify');
var del = require('del');
var notify = require('gulp-notify');

var path = {
	scss: {
		src: 'src/css/app.scss',
		files: 'src/css/**/*.scss',
		dest: 'public/css'
	},
	css: {
		src: 'src/css/external/*.css',
		files: 'src/css/external/*.css',
		dest: 'public/css'
	},
	js: {
		src: ['src/js/external/*.js', 'src/js/includes/*.js', 'src/js/app.js'],
		files: 'src/js/**/*.js',
		dest: 'public/js'
	},
	jsx: {
		src: ['src/js/components/*.jsx'],
		files: 'src/js/components/*.jsx',
		dest: 'public/js/components'
	},
	devJsx: {
		src: './src/js/react/app.jsx',
		files: 'src/js/react/**/*.jsx',
		bundle: 'app.js',
		dest: './public/js/components'
	}
}

gulp.task('sass', function(){
	return gulp.src(path.scss.src)
		.pipe(plumber(function(err){
			console.log(err.message);
			this.emit('end'); // https://github.com/floatdrop/gulp-plumber/issues/8#issuecomment-41465386
		}))
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(gulp.dest(path.scss.dest));
});

gulp.task('css', function(){
	return gulp.src(path.css.src)
	.pipe(plumber(function(err){
		console.log(err.message);
		this.emit('end');
	}))
	.pipe(cssmin({
		noAdvanced: true
	}))
	.pipe(concat('external.css'))
	.pipe(gulp.dest(path.css.dest));
});

gulp.task('uglify', function(){
	return gulp.src(path.js.src)
	.pipe(plumber(function(err){
		console.log(err.message);
		this.emit('end');
	}))
	.pipe(concat('app.js'))
	//.pipe(uglify())
	.pipe(gulp.dest(path.js.dest));
});

gulp.task('watchify', function() {
	var bundler = watchify(browserify(path.devJsx.src, watchify.args));

	function rebundle() {
		return bundler
			.bundle()
			.on('error', notify.onError())
			.pipe(source(path.devJsx.bundle))
			.pipe(gulp.dest(path.devJsx.dest));
	}

	bundler.transform(reactify)
	.on('update', rebundle);
	return rebundle();
});

gulp.task('browserify', function() {
	browserify(path.devJsx.src)
	.transform(reactify)
	.bundle()
	.pipe(source(path.devJsx.bundle))
	.pipe(buffer())
	.pipe(uglify())
	.pipe(gulp.dest(path.devJsx.dest));
});

/*
gulp.task('react', function(){
	return gulp.src(path.react.src)
	.pipe(plumber(function(err){
		console.log(err.message);
		this.emit('end');
	}))
	.pipe(react())
	.pipe(concat('app.js'))
	//.pipe(uglify())
	.pipe(gulp.dest(path.react.dest));
}); */

gulp.task('watch', function(){
	gulp.watch(path.scss.files, ['sass']);
	gulp.watch(path.scss.files, ['css']);
	gulp.watch(path.js.files, ['uglify']);
	gulp.watch(path.devJsx.files, ['watchify']);
	gulp.start(['watchify']);
});

gulp.task('build', function() {
	process.env.NODE_ENV = 'production';
	gulp.start(['browserify']);
});


gulp.task('default', ['sass', 'css', 'uglify', 'watch']);
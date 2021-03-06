var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var react = require('gulp-react');
var cssmin = require('gulp-cssmin');

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var reactify = require('reactify');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

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
		src: './src/js/react/app.jsx',
		files: 'src/js/react/**/*.jsx',
		bundle: 'app.js',
		dest: './public/js/components'
	},
	app: {
		src: ['routes/web/*.js', 'routes/api/*.js', 'helpers/*.js', '/models/*.js'],
		files: ['routes/**/*.js', 'helpers/*.js', '/models/*.js']
	}
}

gulp.task('sass', function() {
	return gulp.src(path.scss.src)
		.pipe(plumber(function(err) {
			console.log(err.message);
			this.emit('end'); // https://github.com/floatdrop/gulp-plumber/issues/8#issuecomment-41465386
		}))
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(gulp.dest(path.scss.dest));
});

gulp.task('css', function() {
	return gulp.src(path.css.src)
	.pipe(plumber(function(err) {
		console.log(err.message);
		this.emit('end');
	}))
	.pipe(cssmin({
		noAdvanced: true
	}))
	.pipe(concat('external.css'))
	.pipe(gulp.dest(path.css.dest));
});

gulp.task('uglify', function() {
	return gulp.src(path.js.src)
	.pipe(plumber(function(err) {
		console.log(err.message);
		this.emit('end');
	}))
	.pipe(concat('app.js'))
	//.pipe(uglify())
	.pipe(gulp.dest(path.js.dest));
});

gulp.task('watchify', function() {
	var bundler = watchify(browserify(path.jsx.src, watchify.args));

	function rebundle() {
		return bundler
			.bundle()
			.on('error', notify.onError())
			.pipe(source(path.jsx.bundle))
			.pipe(gulp.dest(path.jsx.dest));
	}

	bundler.transform(reactify)
	.on('update', rebundle);
	return rebundle();
});

gulp.task('browserify', function() {
	browserify(path.jsx.src)
	.transform(reactify)
	.bundle()
	.pipe(source(path.jsx.bundle))
	.pipe(buffer())
	.pipe(uglify())
	.pipe(gulp.dest(path.jsx.dest));
});

gulp.task('lint', function(){
	return gulp.src(path.app.src)
	.pipe(jshint())
	.pipe(jshint.reporter(stylish));
});

gulp.task('watch', function() {
	gulp.watch(path.scss.files, ['sass']);
	gulp.watch(path.css.files, ['css']);
	gulp.watch(path.app.files, ['lint']);
	gulp.watch(path.js.files, ['uglify']);
	gulp.watch(path.jsx.files, ['watchify']);
});

gulp.task('build', function() {
	process.env.NODE_ENV = 'production';
	gulp.start(['sass', 'css', 'uglify', 'browserify']);
});

gulp.task('default', ['sass', 'css', 'uglify', 'watchify', 'lint', 'watch']);
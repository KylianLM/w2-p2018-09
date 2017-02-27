var gulp = require('gulp'),
stylus = require('gulp-stylus'),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
sourcemaps = require('gulp-sourcemaps'),
browser_sync = require('browser-sync'),
cleanCSS = require('gulp-clean-css'),
reload = browser_sync.reload;

const src = "./src/"
const dist = "./dist/";

gulp.task('stylus', function() {
	return gulp.src( src + './assets/stylus/**/*.styl')
	.pipe(sourcemaps.init())
	.pipe(stylus())
	.pipe(postcss([
		autoprefixer()
		]))
	.pipe(cleanCSS())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest( dist + './assets/css'))
	.pipe(reload({ stream:true }));
});

gulp.task('serve', function() {
	browser_sync({
		server: {
			baseDir: './dist'
		}
	});
	gulp.watch([src + './assets/stylus/**/*.styl'], ['stylus']);
});
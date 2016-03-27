//Requires
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var templateCache = require('gulp-angular-templatecache');

//Vars
var dist = 'dist';
var jsFile = 'angular-reservation.js';
var minJsFile = 'angular-reservation.min.js';
var minCssFile = 'angular-reservation.min.css';

//Generates templates
gulp.task('templates', function () {
  return gulp.src('src/templates/*.html')
    .pipe(templateCache(jsFile, {module: 'hm.reservation'}))
    .pipe(gulp.dest(dist));
});

//Generates angular-reservation.js
gulp.task('concat-js', ['templates'], function () {
  	gulp.src(['src/js/**/*.js', dist + '/' + jsFile])
  	.pipe(concat(jsFile))
  	.pipe(gulp.dest(dist))
});

//Generates angular-reservation.min.js
gulp.task('concat-uglify-js', ['templates'], function () {
  	gulp.src(['src/js/**/*.js', dist + '/' + jsFile])
  	.pipe(concat(minJsFile))
  	.pipe(uglify())
  	.pipe(gulp.dest(dist))
});

//Generates angular-reservation.min.css
gulp.task('minify-css', function() {
  return gulp.src('src/css/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(concat(minCssFile))
    .pipe(gulp.dest(dist));
});

//Configure watch to execute build task on source changes
gulp.task('watch', function() {
    gulp.watch('src/**', ['build']);
});

gulp.task('default', ['concat-js', 'concat-uglify-js', 'minify-css']);
gulp.task('build', ['default']);
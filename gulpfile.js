/**
 * Gulp script
 */

var gulp = require('gulp'),
    less = require('gulp-less'),
    rollup = require('rollup').rollup,
    commonjs = require('rollup-plugin-commonjs'),
    uglify = require('gulp-uglify'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename');

var resource_path = './',
    build_path = 'dist/';

/**
 * Define the less task
 * 
 * Transform the LESS based stylesheet in plain CSS
 */
gulp.task('less', function () {
    return gulp.src(resource_path + 'less/k-search.less')
        .pipe(less())
        .pipe(gulp.dest(build_path + 'css'));
});


/**
 * Define the scripts task.
 * 
 * Bundle the module and all its dependencies using RollupJS
 */
gulp.task('scripts:client', function () {

    return rollup({
        input: 'src/k-search-client.js',
        plugins: [
            nodeResolve({ jsnext: true }),
            commonjs()
        ]
    }).then(function (bundle) {
        return bundle.write({
            format: 'iife',
            file: 'dist/js/k-search-client.js'
        });
    });
});

gulp.task('scripts:all', function () {

    return rollup({
        input: 'src/k-search.js',
        plugins: [
            nodeResolve({ jsnext: true }),
            commonjs()
        ]
    }).then(function (bundle) {
        return bundle.write({
            format: 'iife',
            file: 'dist/js/k-search.js'
        });
    });
});

/**
 * Define the Gulp default task
 */
gulp.task('default', ['less', 'scripts:client', 'scripts:all']);

/**
 * Minify the CSS
 */
gulp.task('minify-css', function () {
    return gulp.src(build_path + 'css/k-search.css')
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(build_path + 'css'));
});


/**
 * Creates a minified version of the script
 */
gulp.task('minify-js', function () {

    return gulp.src([build_path + 'js/k-search.js', build_path + 'js/k-search-client.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(build_path + 'js'));

});

gulp.task('minify', ['minify-css', 'minify-js']);

/**
 * Define the watch task to watch for file changes and 
 * trigger the appropriate tasks for producing the distributable files
 */
gulp.task('watch', function () {
    gulp.watch(resource_path + 'less/**/*.less', ['less']);
    gulp.watch(resource_path + 'src/**/*.js', ['scripts:client', 'scripts:all']);
});
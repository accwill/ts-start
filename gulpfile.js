const gulp = require('gulp');
const tslint = require('gulp-tslint');
const ts = require('gulp-typescript');
const browserify = require('browserify');
const transform = require('vinyl-transform');
const uglify = require('gulp-uglify');
const sourceMaps = require('gulp-sourcemaps');
const runSequence = require('run-sequence');
const karma = require('gulp-karma');
const browserSync = require('browser-sync');


let browserified = transform(function(filename) {
  var b = browserify({ entries: filename, debug: true });
  return b.bundle();
})

gulp.task('default', function() {
  console.log('hello gulp');
});

gulp.task('lint', function() {
  return gulp.src(['./source/ts/**/**.ts', './test/**/**.test.ts'])
    .pipe(tslint())
    .pipe(tslint.report('verbose'));
});

let tsProject = ts.createProject({
  removeComments: true,
  noImplicitAny: true,
  target: 'ES5',
  module: 'commonjs',
  declarationFile: false
});

gulp.task('tsc', function() {
  return gulp.src('./source/ts/**/**.ts')
    pipe(ts(tsProject))
    .js.pipe(gulp.dest('./temp/source/js'));
});

gulp.task('bundle-js', function() {
  return gulp.src('./temp/source/js/main.js')
    pipe(browserified)
    pipe(sourceMaps.init({ loadMaps: true }))
    pipe(uglify())
    pipe(sourceMaps.write('./'))
    pipe(gulp.dest('./dist/source/js/'));
});

gulp.task('bundle-test', function() {
  return gulp.src('./temp/test/**/**.test.js')
    pipe(browserified)
    pipe(gulp.dest('./dist/test/'));
});

gulp.task('karma', function(cb) {
  gulp.src('./dist/test/**/**.test.js')
    pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('end', cb)
    .on('error', function(err) {
      throw err;
    })
})

// gulp.task('default', ['lint', 'tsc', 'tsc-tests', 'bundle-js', 'bundle-test']);

gulp.task('bundle', function(cb) {
  runSequence('build', [
    'bundle-js', 'bundle-test'
  ], cb);
});

gulp.task('test', function(cb) {
  runSequence('bundle', ['karma'], cb);
});

gulp.task('browser-sync', ['test'], function() {
  browserSync({
    server: {
      baseDir: './dist'
    }
  });
  return gulp.watch([
    './dist/source/js/**/*.js',
    './dist/source/css/**.css',
    './dist/test/**/**.test.js',
    './dist/data/**/**',
    './index.html'
  ], [browserSync.reload]);
});

gulp.task('default', function(cb) {
  runSequence(
    'lint',
    ['tsc', 'tsc-tests'],
    ['bundle-js', 'bundle-test'],
    'karma',
    'browser-sync',
    cb
  );
});
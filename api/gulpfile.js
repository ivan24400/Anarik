const gulp = require('gulp');
const apidoc = require('gulp-apidoc');
const jsdoc = require('gulp-jsdoc3');

/**
 * Generate documentation files
 */
gulp.task('apidoc', done => {
  apidoc({
    src: './routes',
    dest: '../documentation/api',
  }, done);
});


gulp.task('appdoc', done => {
  gulp.src(['../README.md', './app/**/*.js'], {read: false})
    .pipe(jsdoc(done))
    .pipe(gulp.dest('../documentation/app'));
});

gulp.task('watch', () => {
  gulp.watch(['./routes/**'], ['apidoc']);
});

gulp.task('default', gulp.series(['apidoc', 'appdoc']));

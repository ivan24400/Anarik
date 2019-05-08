const gulp = require('gulp');
const apidoc = require('gulp-apidoc');
const jsdoc = require('gulp-jsdoc3');

/**
 * Generate api documentation
 */
gulp.task('apidoc', done => {
  apidoc({
    src: './routes',
    dest: '../docs-api',
  }, done);
});

 
gulp.task('appdoc', function (cb) {
    gulp.src(['../README.md', './app/**/*.js'], {read: false})
        .pipe(jsdoc(cb))
        .pipe(gulp.dest('../docs-app'));
});

gulp.task('watch', () => {
  gulp.watch(['./routes/**'], ['apidoc']);
});

const gulp = require('gulp');
const apidoc = require('gulp-apidoc');

/**
 * Generate api documentation
 */
gulp.task('apidoc', done => {
  apidoc({
    src: './routes',
    dest: '../docs-api',
  }, done);
});

gulp.task('watch', () => {
  gulp.watch(['./routes/**'], ['apidoc']);
});

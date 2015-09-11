var connect = require('gulp-connect');
var gulp = require('gulp');
var oghliner = require('oghliner');

gulp.task('default', ['offline']);

gulp.task('offline', function(callback) {
  oghliner.offline({
    rootDir: './',
    fileGlobs: [
      '{css,img,js,brick}/**/*.{js,css,png,jpg,gif,ttf}',
      'index.html',
      'favicon.ico',
    ]
  }, callback);
});

gulp.task('serve', function () {
  connect.server({
    root: './',
  });
});

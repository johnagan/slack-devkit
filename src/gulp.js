const
  gulp = require('gulp'),
  pug = require('gulp-pug'),
  concat = require('gulp-concat'),
  data = require('./data.json'),
  DOCS_PATH = '../docs'

gulp.task('css', function() {
  return gulp.src('docs/css/*.css')
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(DOCS_PATH))
})

gulp.task('html', () => {
  return gulp.src('docs/*.pug')
    .pipe(pug({ data }))
    .pipe(gulp.dest(DOCS_PATH))
})

gulp.task('assets', () => {
  gulp.src('docs/assets/*')
    .pipe(gulp.dest(DOCS_PATH))
})

gulp.task('default', ['html', 'css', 'assets'])
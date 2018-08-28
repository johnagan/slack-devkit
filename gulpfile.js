const
  gulp = require('gulp'),
  pug = require('gulp-pug'),
  concat = require('gulp-concat')

gulp.task('css', function() {
  return gulp.src('src/docs/css/*.css')
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('docs'))
})

gulp.task('html', () => {
  const data = require('./src/docs/data.json')
  return gulp.src('src/docs/*.pug')
    .pipe(pug({ data }))
    .pipe(gulp.dest('docs'))
})

gulp.task('assets', () => {
  gulp.src('src/docs/assets/*')
    .pipe(gulp.dest('docs'))
})

gulp.task('docs', ['html', 'css', 'assets'])

gulp.task('default', ['docs'])
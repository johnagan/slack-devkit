const gulp = require('gulp')
const pug = require('gulp-pug')
const concat = require('gulp-concat')
const minifyCSS = require('gulp-csso')
const DOCS_PATH = '../docs'

const data = {}

gulp.task('css', function() {
  return gulp.src('docs/css/*.css')
    // .pipe(minifyCSS({}))
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
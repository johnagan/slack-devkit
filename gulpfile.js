const
  gulp = require('gulp'),
  pug = require('gulp-pug'),
  concat = require('gulp-concat'),
  ts = require('gulp-typescript'),
  tslint = require('gulp-tslint')

gulp.task('tslint', () =>
  gulp.src('src/**/*.ts')
  .pipe(tslint({
    formatter: 'verbose'
  }))
  .pipe(tslint.report())
)

gulp.task('typescript', ['tslint'], () => {
  const tsProject = ts.createProject('tsconfig.json')

  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('dist'))
})

gulp.task('css', () => {
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
gulp.task('default', ['typescript', 'docs'])
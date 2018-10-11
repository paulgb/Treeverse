const gulp = require('gulp');
const ts = require('gulp-typescript');
const concat = require('gulp-concat');
const newer = require('gulp-newer');
const download = require('gulp-download');
const fs = require('fs');
const zip = require('gulp-zip');

var backgroundProject = ts.createProject('src/background/tsconfig.json');

gulp.task('background', () => {
    return backgroundProject.src()
        .pipe(newer('extension/resources/script/background.js'))
        .pipe(backgroundProject())
        .js.pipe(concat('background.js'))
        .pipe(gulp.dest('extension/resources/script/'));
});

var viewerProject = ts.createProject('src/viewer/tsconfig.json');

gulp.task('viewer', () => {
    return viewerProject.src()
        .pipe(newer('extension/resources/script/viewer.js'))
        .pipe(viewerProject())
        .js.pipe(concat('viewer.js'))
        .pipe(gulp.dest('extension/resources/script/'));
});

gulp.task('scripts', ['viewer', 'background']);

gulp.task('watch', ['scripts'], () => {
    gulp.watch('src/viewer/*.ts', ['viewer']);
    gulp.watch('src/background/*.ts', ['background']);
});

gulp.task('default', ['scripts']);

gulp.task('package', ['scripts'], () => {
    return gulp.src('./extension/**')
        .pipe(zip('extension.zip'))
        .pipe(gulp.dest('./'))
});

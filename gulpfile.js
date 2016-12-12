var gulp = require("gulp");
var ts = require("gulp-typescript");
var concat = require("gulp-concat");
var newer = require("gulp-newer");
var download = require("gulp-download");
var fs = require('fs');

gulp.task("deps", () => {
    if (!fs.existsSync("src/lib/d3.v4.min.js")) {
        download("https://d3js.org/d3.v4.min.js")
            .pipe(gulp.dest("src/lib/"));
    }

    gulp.src("src/lib/*.js")
        .pipe(newer("extension/script/lib.js"))
        .pipe(concat("lib.js"))
        .pipe(gulp.dest("extension/script/"));
});

var backgroundProject = ts.createProject("src/background/tsconfig.json");

gulp.task("background", () => {
    return backgroundProject.src()
        .pipe(newer('extension/script/background.js'))
        .pipe(backgroundProject())
        .js.pipe(concat('background.js'))
        .pipe(gulp.dest("extension/script/"));
});

var viewerProject = ts.createProject("src/viewer/tsconfig.json");

gulp.task("viewer", () => {
    return viewerProject.src()
        .pipe(newer('extension/script/viewer.js'))
        .pipe(viewerProject())
        .js.pipe(concat('viewer.js'))
        .pipe(gulp.dest("extension/script/"));
});

gulp.task("scripts", ["viewer", "background"]);

gulp.task("watch", ["scripts"], () => {
    gulp.watch('src/viewer/*.ts', ["viewer"]);
    gulp.watch('src/background/*.ts', ["background"]);
});

gulp.task("default", ["scripts"]);
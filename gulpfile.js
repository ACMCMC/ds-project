var gulp = require("gulp"),
    sass = require("gulp-sass"),
    cssmin = require("gulp-cssmin");

gulp.task("transpile:sass", function() {
    return gulp.src("./src/index.scss")
        .pipe(sass({ includePaths: "./node_modules" }).on("error", sass.logError))
        .pipe(cssmin())
        .pipe(gulp.dest("./src/css/"));
});
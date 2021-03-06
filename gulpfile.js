const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
// var minify = require('html-minifier-terser').minify;

// Moving files to build folder

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico",
    // "source/*.html"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
};

exports.copy = copy;

const copyhtml = () => {
  return gulp.src("source/*.html",
  {
    base: "source"
  })
  .pipe(gulp.dest("build"));
};

exports.copyhtml = copyhtml;

const htmlminify = () => {
  return gulp.src("build/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"))
};

exports.htmlminify = htmlminify;

const copysprite = () => {
  return gulp.src("source/img/sprite.svg",
  {
    base: "source"
  })
  .pipe(gulp.dest("build"));
};

exports.copysprite = copysprite;


const clean = () => {
  return del("build");
}

exports.clean = clean;

// Images

const images = () => {
  return gulp.src("build/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.images = images;

const makewebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"))
}

exports.makewebp = makewebp;

const sprite = () => {
  return gulp.src("build/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// Minification

const jsmin = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
};

exports.jsmin = jsmin;

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", gulp.series(copyhtml, htmlminify, sync.reload));
  gulp.watch("source/js/**/*.js").on("change", gulp.series("jsmin"));
}

const build = gulp.series(
  clean,
  copy,
  copyhtml,
  htmlminify,
  styles,
  jsmin,
  images,
  // copysprite,
  sprite,
);

exports.build = build;

exports.default = gulp.series(
  build, server, watcher
);

const gulp = require("gulp");
const del = require("del");
const minHTML = require("gulp-htmlmin");
const minifyCSS = require("gulp-csso");
const concat = require("gulp-concat");
const htmlReplace = require("gulp-html-replace");
const uglify = require("gulp-uglify");
const eslint = require("gulp-eslint");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber");
const minifyInline = require("gulp-minify-inline");
let babel = require("gulp-babel");
let zip = require("gulp-zip");

let version = new Date().getTime();

const destinationFolder = "dist";

console.log(">> Building to ", destinationFolder);

gulp.task("lint", () => {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return (
    gulp
      .src(["widget/**/*.js", "control/**/*.js"])
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(
        eslint({
          env: {
            browser: true,
            es6: true,
          },
          extends: "eslint:recommended",
          parserOptions: {
            sourceType: "module",
            ecmaVersion: 2017,
          },
          rules: {
            "no-console": ["off"],
          },
        })
      )
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError())
  );
});

const cssTasks = [
  { name: "widgetCSS", src: "widget/**/*.css", dest: "/widget" },
  {
    name: "controlContentCSS",
    src: ["control/assets/*.css", "control/content/**/*.css"],
    dest: "/control/content",
  },
  {
    name: "controlSettingsCSS",
    src: "control/settings/**/*.css",
    dest: "/control/settings",
  },
];

cssTasks.forEach(function (task) {
  /*
     Define a task called 'css' the recursively loops through
     the widget and control folders, processes each CSS file and puts
     a processes copy in the 'build' folder
     note if the order matters you can import each css separately in the array

     */
  gulp.task(task.name, function () {
    return (
      gulp
        .src(task.src, { base: "." })

        /// minify the CSS contents
        .pipe(minifyCSS())

        ///merge
        .pipe(concat("styles.min.css"))

        /// write result to the 'build' folder
        .pipe(gulp.dest(destinationFolder + task.dest))
    );
  });
});

const jsTasks = [
  {
    name: "widgetJS",
    src: [
      "widget/js/classes/*.js",
      "widget/js/lib/*.js",
      "widget/js/*.js",
      "widget/app.js",
    ],
    dest: "/widget",
  },
  {
    name: "controlContentJS",
    src: [
      "control/content/js/classes/*.js",
      "control/content/js/lib/*.js",
      "control/content/js/*.js",
      "control/content/app.js",
    ],
    dest: "/control/content",
  },
  {
    name: "controlSettingsJS",
    src: [
      "control/settings/js/classes/*.js",
      "control/settings/js/*.js",
      "control/settings/app.js",
    ],
    dest: "/control/settings",
  },
];

jsTasks.forEach(function (task) {
  gulp.task(task.name, function () {
    return gulp
      .src(task.src, { base: "." })
      .pipe(plumber())
      .pipe(
        babel({
          presets: ["@babel/preset-env"],
        })
      )
      .pipe(uglify())
      .pipe(concat("scripts.min.js"))
      .pipe(gulp.dest(destinationFolder + task.dest));
  });
});

/*
 Define a task called 'html' the recursively loops through
 the widget and control folders, processes each html file and puts
 a processes copy in the 'build' folder
 */
gulp.task("controlHTML", function () {
  return gulp
    .src(["control/**/*.html"], { base: "." })
    .pipe(
      htmlReplace({
        bundleControlBFMinJS: {
          src: "../../../../scripts/buildfire.min.js",
          tpl: '<script src="%s"></script>',
        },
        bundleJSFiles: "scripts.min.js?v=" + version,
        bundleCSSFiles: "styles.min.css?v=" + version,
      })
    )
    .pipe(minHTML({ removeComments: true, collapseWhitespace: true }))
    .pipe(minifyInline())
    .pipe(gulp.dest(destinationFolder));
});

gulp.task("widgetHTML", function () {
  return gulp
    .src(["widget/*.html"], { base: "." })
    .pipe(
      htmlReplace({
        bundleWidgetBFMinJS: {
          src: "../../../scripts/buildfire.min.js",
          tpl: '<script src="%s"></script>',
        },
        bundleJSFiles: "scripts.min.js?v=" + version,
        bundleCSSFiles: "styles.min.css?v=" + version,
      })
    )
    .pipe(minHTML({ removeComments: true, collapseWhitespace: true }))
    .pipe(minifyInline())
    .pipe(gulp.dest(destinationFolder));
});

gulp.task("resources", function () {
  return gulp
    .src(["resources/*", "plugin.json"], { base: "." })
    .pipe(imagemin())
    .pipe(gulp.dest(destinationFolder));
});

gulp.task("images", function () {
  return gulp
    .src(["**/.images/**"], { base: "." })
    .pipe(imagemin())
    .pipe(gulp.dest(destinationFolder));
});

gulp.task("clean", function () {
  return del([destinationFolder, "../metricActionItemPlugin_release.zip"], {
    force: true,
  });
});

var buildTasksToRun = ["controlHTML", "widgetHTML", "resources", "images"];

gulp.task("zip", function () {
  return gulp
    .src("./dist/**", { dot: true })
    .pipe(zip("metricActionItemPlugin_release.zip"))
    .pipe(gulp.dest("../"));
});

cssTasks.forEach(function (task) {
  buildTasksToRun.push(task.name);
});
jsTasks.forEach(function (task) {
  buildTasksToRun.push(task.name);
});

gulp.task("build", gulp.series("lint", "clean", ...buildTasksToRun, "zip"));

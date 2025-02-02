// gulpfile.js
const path = require('path');
const gulp = require('gulp');
const del = require('del');
const vfs = require("vinyl-fs");
const vinylPaths = require("vinyl-paths");
const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const typescript = require('typescript');
const dts = require('dts-bundle');
const typedoc = require('gulp-typedoc');

const tsProject = ts.createProject('tsconfig.json', {
  typescript: typescript
});

gulp.task('clean-symlinks', function runCleanSymlinks () {
  return vfs.src([
    'dist/package.json',
    'dist/README.md',
  ], {
    resolveSymlinks: false,
    allowEmpty: true
  })
    .pipe(vinylPaths(del))
});


gulp.task(
  'compile-source',
  gulp.series(['clean-symlinks'], function runCompileSource () {
    return gulp.src([
      "src/**/*.ts",
      "!**/test/*.ts"
    ])
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(tsProject())
      .pipe(babel({
        ignore: ["**/*.d.ts"]
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
  })
);

gulp.task(
  'compile-test',
  gulp.series(['compile-source'], function runCompileTest () {
    return gulp.src([
      "test/**/*.ts",
      "!**/test/*.ts"
    ])
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(tsProject())
      .pipe(babel({
        ignore: ["**/*.d.ts"]
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist/test'))
  })
);

gulp.task('compile', gulp.series(['compile-source']));

gulp.task(
  'declarations',
  gulp.series(['compile'], async function runDeclarations () {
    return dts.bundle({
      name: "ethpm",
      main: "dist/ethpm.d.ts",
      baseDir: "dist",
      out: "main.d.ts"
    })
  })
);

gulp.task('copy-readme', function runCopyReadme () {
  return vfs.src([
    'README.md'
  ], { resolveSymlinks: false })
    .pipe(vfs.dest('dist'))
});

gulp.task(
  'copy-symlinks',
  gulp.series(['copy-readme'], function runCopySymlinks () {
    return vfs.src([
      'package.json',
    ], { resolveSymlinks: false })
      .pipe(vfs.symlink('dist'))
  })
);


gulp.task('docs', function runDocs () {
  return gulp.src([
    "src/**/*.ts",
    "!src/index.ts",
    "!**/test/*.ts",
    "test/**/*.ts"
  ])
    .pipe(typedoc({
      ...require("./typedoc.json"),
      logger: 'none'
    }));
});

gulp.task('build', gulp.series(['declarations', 'copy-symlinks']));

gulp.task('watch', gulp.series(['build'], function runWatch () {
  return gulp.watch([
    'src/**/*.ts',
    'test/**/*.ts',
    'types/**/*.ts',
  ], gulp.series(['build']))
}));

gulp.task('default', gulp.series(['build']));

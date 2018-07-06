# gulp-inline-html

[![NPM version](https://img.shields.io/npm/v/gulp-inline-html.svg?style=flat)](https://www.npmjs.com/package/gulp-inline-html)
[![Build Status](https://secure.travis-ci.org/daizch/gulp-inline-html.svg?branch=master)](http://travis-ci.org/daizch/gulp-inline-html)

> A [gulp](https://github.com/gulpjs/gulp) plugin to inline js&css files into html file.

## Usage

Firstly, install `gulp-inline-html` as a development dependency:

```shell
npm install gulp-inline-html --save
```

Then, add it into your `gulpfile.js`:

**concat all files according to each directory:**

```javascript
const inlineHtml = require("gulp-inline-html");
const gulpIf = require('gulp-if');
const babel =  require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer')

function fileType(extname) {
  extname = (extname[0] === '.' ? '' : '.') + extname
  return function (file) {
    return path.extname(file.path) === extname
  }
}

var isHtml = fileType('html')
var isJs = fileType('js')
var isCss = fileType('css')

gulp.src("./src/**/*")
    //dosth with js and css
    .pipe(gulpIf(isJs, babel()))
    .pipe(gulpIf(isCss,  autoprefixer({browsers: ['> 5%']})))
    
    .pipe(inlineHtml())
    .pipe(gulp.dest("build"));
```

## Parameters

### disabledTypes
Type: `Array`
Default: []

To disable which file type not inline into html file.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
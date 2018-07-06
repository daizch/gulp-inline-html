"use strict";

const path = require('path')
const through = require('through2')
var File = require('vinyl');
var cheerio = require('cheerio');
var isUrl = require('is-url')


function stringifyAttrs(attrs) {
  return Object.entries(attrs).map(function (entries) {
    return entries.join('=')
  }).join(' ')
}

function isLocal(href) {
  return href && !isUrl(href)
}

function spliceAttrs(attrs, keys) {
  keys = [].concat(keys)
  keys.forEach(k => {
    delete attrs[k];
  });
  return stringifyAttrs(attrs);
}

function inlineCode(opts) {
  var files = {};
  opts = Object.assign({
    disabledTypes: []
  }, opts || {})

  function filePipeLine(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file)
    }

    if (file.isStream()) {
      this.emit('error', new Error('gulp-inline-html: Stream not supported'));
      cb();
      return;
    }

    files[file.path] = file;
    cb()
  }

  const inlineTypes = {
    css: {
      tag: 'link',
      template: function (contents, el) {
        var attrs = el[0].attribs || {};
        var attrStr = spliceAttrs(attrs, 'href');
        return `<style ${attrStr}>\n${String(contents)}\n</style>`
      },
      filter: function (el) {
        return el.attr('rel') === 'stylesheet' && isLocal(el.attr('href'))
      },
      getSrc: function (el) {
        return el.attr('href')
      }
    },
    js: {
      tag: 'script',
      template: function (contents, el) {
        var attrs = el[0].attribs || {};
        var attrStr = spliceAttrs(attrs, 'src');
        return `<script ${attrStr}>\n ${String(contents)}\n</script>`
      },
      filter: function (el) {
        return isLocal(el.attr('src'))
      },
      getSrc: function (el) {
        return el.attr('src')
      }
    }
  };


  function replace($, file, opt) {
    $(opt.tag).each(function (index, el) {
      var $el = $(el);
      if (opt.filter($el)) {
        var src = opt.getSrc($el);
        src = path.resolve(path.dirname(file.path), src);
        var target = files[src]
        if (target) {
          $el.replaceWith(opt.template(target.contents, $el));
        }
      }
    })
  }

  function endStream(cb) {
    var self = this;
    Object.keys(files).forEach(fp => {
      var ext = path.extname(fp).slice(1);
      var file = files[fp];

      if (ext === 'html') {
        var $ = cheerio.load(String(file.contents), {
          decodeEntities: false,
          useHtmlParser2: true,
          lowerCaseAttributeNames: false
        });
        Object.keys(inlineTypes).forEach((type) => {
          if (!opts.disabledTypes.includes(type)) {
            var opt = inlineTypes[type];
            replace($, file, opt)
          }
        });

        file.contents = new Buffer($.html())
        self.push(file)
      }
    });
    cb();
  }

  return through.obj(filePipeLine, endStream)
}

module.exports = inlineCode


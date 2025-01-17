"use strict";
exports.__esModule = true;
exports.stripCSSComments = void 0;
var is_regexp_1 = require("is-regexp");
var stripCSSComments = function (str, opts) {
    if (opts === void 0) { opts = {}; }
    str = str.toString();
    var preserveFilter;
    var comment = '';
    var currentChar = '';
    var insideString = false;
    var preserveImportant = !(opts.preserve === false || opts.all === true);
    var ret = '';
    if (typeof opts.preserve === 'function') {
        preserveImportant = false;
        preserveFilter = opts.preserve;
    }
    else if ((0, is_regexp_1["default"])(opts.preserve)) {
        preserveImportant = false;
        preserveFilter = function (comment) { return opts.preserve.test(comment); };
    }
    for (var i = 0; i < str.length; i++) {
        currentChar = str[i];
        if (str[i - 1] !== '\\') {
            if (currentChar === '"' || currentChar === '\'') {
                if (insideString === currentChar) {
                    insideString = false;
                }
                else if (!insideString) {
                    insideString = currentChar;
                }
            }
        }
        // find beginning of /* type comment
        if (!insideString && currentChar === '/' && str[i + 1] === '*') {
            // ignore important comment when configured to preserve comments using important syntax: /*!
            if (!(preserveImportant && str[i + 2] === '!')) {
                var j = i + 2;
                // iterate over comment
                for (; j < str.length; j++) {
                    // find end of comment
                    if (str[j] === '*' && str[j + 1] === '/') {
                        if (preserveFilter) {
                            // evaluate comment text
                            ret = preserveFilter(comment) ? "".concat(ret, "/*").concat(comment, "*/") : ret;
                            comment = '';
                        }
                        break;
                    }
                    // store comment text to be evaluated by the filter when the end of the comment is reached
                    if (preserveFilter) {
                        comment += str[j];
                    }
                }
                // resume iteration over CSS string from the end of the comment
                i = j + 1;
                continue;
            }
        }
        ret += currentChar;
    }
    return ret;
};
exports.stripCSSComments = stripCSSComments;

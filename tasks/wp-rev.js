/*
 * grunt-wp-rev
 * https://github.com/cbas/grunt-rev
 *
 * Copyright (c) 2013 Sebastiaan Deckers
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
  path = require('path'),
  crypto = require('crypto');

module.exports = function (grunt) {

    function md5(filepath, algorithm, encoding) {
        var hash = crypto.createHash(algorithm);
        grunt.log.verbose.write('Hashing ' + filepath + '...');
        hash.update(grunt.file.read(filepath));
        return hash.digest(encoding);
    }

    grunt.registerMultiTask('wpRev', 'Prefix static asset file names with a content hash, change names in calls', function () {

        var options = this.options({
            algorithm: 'md5',
            length: 8,
            revert: false,
            file: ''
        });

        this.files.forEach(function (filePair) {
            filePair.src.forEach(function (f) {

                var hash = md5(f, options.algorithm, 'hex'),
                prefix = hash.slice(0, options.length),
                filename = path.basename(f),
                ext = path.extname(filename),
                baseName = path.basename(filename, ext),
                renamed;
                if (options.revert) {
                    renamed = [baseName, prefix, ext.slice(1)].join('.');
                }
                else {
                    renamed = [prefix, filename].join('.');
                }
                var outPath = path.resolve(path.dirname(f), renamed),
                content = grunt.file.read(options.file);

                content = content.replace(filename, renamed);
                grunt.verbose.ok().ok(hash);
                fs.renameSync(f, outPath);
                grunt.log.write(f + ' ').ok(renamed);

                grunt.file.write(options.file, content);
                grunt.log.writeln('"' + options.file + '" updated with new CSS/JS versions.');
            });
        });

    });

};

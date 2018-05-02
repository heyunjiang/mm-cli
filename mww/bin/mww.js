#!/usr/bin/env node

'use strict';

var program = require('commander');

const showVersion = ()=>{
	console.log(require('../package.json').version)
}

program
  .version('0.0.1')
  .option('-v, --version', 'show version', showVersion);

program
    .command('list')
    .description('list files in current working directory')
    .option('-a, --all', 'Whether to display hidden files')
    .action(function(options) {
        var fs = require('fs');
        fs.readdir(process.cwd(), function(err, files) {
            var list = files;
            if (!options.all) {
                list = files.filter(function(file) {
                    return file.indexOf('.') !== 0;
                });
            }
            console.log(list.join(' '));
        });
    });

program.parse(process.argv);

console.log(process.argv);

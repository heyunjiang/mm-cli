/*
 * 入口文件
 * designer: heyunjiang
 * time: 2018.4.20
 * update: 2018.5.2
 */

'use strict';

var program = require('commander');
var addFileFold = require('./addFileFold');
var fileCopy = require('./fileCopy');
var excute = require('./excute');
const join = require('path').join;

const showVersion = function() {
	console.log(require('../package.json').version)
}

console.log(process.argv)

program
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

program
    .command('new')
    .description('create filefold in current working directory')
    .option('-un, --uninstall', 'Whether to install node_modules')
    .action(function(options) {
        const foldName = program.args[0]
        if(typeof(foldName) !== 'string') {
            console.log('请输入项目名称')
            process.exit(1)
        }
        /*1. 创建工程目录*/
        addFileFold(foldName)
        /*2. 进入工程目录*/
        process.chdir(join(process.cwd(), foldName))
        /*3. 复制工程文件*/
        fileCopy(function(){
            //复制完毕
            if (!options.uninstall) {
                /*4. 执行 npm install*/
                excute(function(code) {
                    /*console.error(`
${foldName} is created, use

  cd ${foldName}

to enter your created path`)
*/                })
            }
        })
    });

program.parse(process.argv);


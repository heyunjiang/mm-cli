#!/usr/bin/env node

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
var osInfo = require('./osInfo');
const join = require('path').join;

const showVersion = function() {
	console.log(require('../package.json').version)
}

const getSourceFileFolderName = function() {
    let nameArr =  require('fs').readdirSync(require('path').resolve(__dirname, '..', 'src'));
    return nameArr.join(' | ')
}

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
    .command('os')
    .description('列出os信息，网络端口信息')
    .action(function() {
        osInfo()
    });

program
    .command('new')
    .description('create filefold in current working directory')
    .option('-u, --uninstall', 'Whether to install node_modules')
    .action(function(options) {
        const foldName = program.args[0]
        if(typeof(foldName) !== 'string') {
            console.warn('请输入项目名称');
            process.exit(1);
        }
        process.stdout.write('请输入构建项目类型(' + getSourceFileFolderName() + '): ');
        let choice = 'react';
        process.stdin.once('data', function (choice) {
            choice = (choice+'').trim();
            if(!['react', 'vue', 'reactSimple'].includes(choice)) {
                console.warn('项目类型必须为 ' + getSourceFileFolderName() + ' 中的一种');
                process.exit(1);
            }
            build(foldName, choice);
        });
    });

program.parse(process.argv);


function createSuccess(foldName) {
    console.error(`
${foldName} is created, use

  cd ${foldName}

to enter your created path`)
    process.exit(0);
}

/*
 * 创建项目
 */
function build(foldName, type) {
    /*1. 创建工程目录*/
    addFileFold(foldName)
    /*2. 进入工程目录*/
    process.chdir(join(process.cwd(), foldName))
    /*3. 复制工程文件*/
    fileCopy(type, function(){
        //复制完毕
        if (!program.args[1].uninstall) {
            /*4. 执行 npm install*/
            excute(function(code) {
                createSuccess(foldName)
            })
        } else {
             createSuccess(foldName)
        }
    })
}


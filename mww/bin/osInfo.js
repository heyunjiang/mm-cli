'use strict';

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * 列出os信息，网络端口信息
 * designer: heyunjiang
 * time: 2018.5.10
 * update: 2018.5.10
 */
var log = function log(str) {
  console.log(str);
};
var logBlue = function logBlue(str) {
  console.log(_chalk2.default.blue(str));
};
var logGreen = function logGreen(str) {
  console.log(_chalk2.default.green(str));
};

var osInfo = function osInfo() {
  logGreen('----------------------------------------------------');
  logBlue('cpu 架构');
  log(_os2.default.arch());
  logGreen('----------------------------------------------------');
  logBlue('cpu信息');
  log(_os2.default.cpus());
  logGreen('----------------------------------------------------');
  logBlue('网络接口');
  log(_os2.default.networkInterfaces());
  logGreen('----------------------------------------------------');
  logBlue('操作系统平台');
  log(_os2.default.platform());
  logGreen('----------------------------------------------------');
  logBlue('当前用户信息');
  log(_os2.default.userInfo());
  logGreen('----------------------------------------------------');
  logBlue('当前端口使用情况');
  if (_os2.default.platform() === 'win32') {
    var netstat = require('child_process').spawn('netstat', ['-ano']);
    netstat.stdout.on('data', function (data) {
      log(data.toString());
      logGreen('----------------------------------------------------');
    });
    netstat.stderr.on('data', function (data) {
      log(data);
    });
  } else {
    log(_chalk2.default.red('暂时只支持windows操作系统'));
  }
};

module.exports = osInfo;

/*const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('你认为 Node.js 中文网怎么样？', (answer) => {
  console.log(answer)
  rl.close()
});*/
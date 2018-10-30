/*
 * 执行 npm install 命令
 * 关键知识点：require('child_process').spawn
 * designer: heyunjiang
 * time: 2018.5.2
 * update: 2018.5.2
 */
const which = require('which')

const excute = function(cb) {
  if(!cb || typeof(cb) !== 'function') {
	  console.error('回调函数传参错误')
	  process.exit(1)
  }
  const resolved = which.sync('npm', {nothrow: true})

  if (resolved === null) {
    throw new Error('please install npm')
  } else {
    console.log(`run npm install
      
      npm packages are installing, please wait a minute!!!

(if you want to not install, you can use --uninstall command)`)
    const runner = require('child_process').spawn(resolved, ['install'])
    runner.on('close', function (code) {
      cb(code)
  	});
  }
}

module.exports = excute




/*
 * 执行命令
 */
const which = require('which')

const resolved = which.sync('npm', {nothrow: true})

if (resolved === null) {
  throw new Error('please install npm')
} else {
  const npm = require('child_process').spawn(resolved, ['-v'])
  npm.on('close', function(code){
  	console.log(code)
  })
}


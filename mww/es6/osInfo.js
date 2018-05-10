/*
 * 列出os信息，网络端口信息
 * designer: heyunjiang
 * time: 2018.5.10
 * update: 2018.5.10
 */
import os from 'os'
import chalk from 'chalk'

const log = (str) => {console.log(str)}
const logBlue = (str) => {console.log(chalk.blue(str))}
const logGreen = (str) => {console.log(chalk.green(str))}

const osInfo = () => {
  logGreen('----------------------------------------------------')
  logBlue('cpu 架构')
  log(os.arch())
  logGreen('----------------------------------------------------')
  logBlue('cpu信息')
  log(os.cpus())
  logGreen('----------------------------------------------------')
  logBlue('网络接口')
  log(os.networkInterfaces())
  logGreen('----------------------------------------------------')
  logBlue('操作系统平台')
  log(os.platform())
  logGreen('----------------------------------------------------')
  logBlue('当前用户信息')
  log(os.userInfo())
  logGreen('----------------------------------------------------')
  logBlue('当前端口使用情况')
  if(os.platform() === 'win32') {
    const netstat = require('child_process').spawn('netstat', ['-ano'])
    netstat.stdout.on('data', (data) => {
  	  log(data.toString())
      logGreen('----------------------------------------------------')
  	});
  	netstat.stderr.on('data', (data) => {
  	  log(data);
  	});
  }else {
  	log(chalk.red('暂时只支持windows操作系统'))
  }
}

module.exports = osInfo



/*const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('你认为 Node.js 中文网怎么样？', (answer) => {
  console.log(answer)
  rl.close()
});*/

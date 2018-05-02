/*
 * 当前进程目录下创建文件夹
 *
 * @require name 文件夹名称
 * designer: heyunjiang
 * time: 2018.5.2
 */
const {existsSync, mkdirSync} = require('fs');
const join = require('path').join;

const addFileFold = function (name) {
  if(!name || typeof(name)!=='string') {
  	console.error("fileFoldName is util.isUndefined!!!;")
    process.exit(1);
  }
  const dest = join(process.cwd(), name);

  if (existsSync(dest)) {
    console.error(name+" has already exist, please choose another name")
    process.exit(1);
  }

  mkdirSync(dest)
}

module.exports = addFileFold

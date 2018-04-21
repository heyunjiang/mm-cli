/*创建目录*/
const {existsSync, mkdirSync} = require('fs');
const join = require('path').join;

const dest = join(process.cwd(), process.argv[2]);

if (existsSync(dest)) {
  console.log(process.argv[2]+" has already exist, please choose another name")
  process.exit(1);
}

mkdirSync(dest)


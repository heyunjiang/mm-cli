/*
 * 复制项目工程文件, 将 src 目录下所有文件复制到 process.ced() 目录下
 * 关键知识点：stream.pipe, vinyl-fs
 * designer: heyunjiang
 * time: 2018.5.2
 * update: 2018.5.2
 * todo：vinyl-fs实现的文件夹复制是怎么实现的
 */

const join = require('path').join;
const stream = require('stream');
const vfs = require('vinyl-fs');
const {createReadStream, createWriteStream} = require('fs');

const fileCopy = function(cb) {
	if(!cb || typeof(cb) !== 'function') {
		console.error('回调函数传参错误')
		process.exit(1)
	}
	const dest = process.cwd()
	const src = join(__dirname, '../src')
	try {
	  vfs.src(['**/*', '!node_modules/**/*'], {cwd: src, cwdbase: true, dot: true})
	    .pipe(vfs.dest(dest))
	    .on('end', function() {
	      cb()
	    })
	    .resume();
	} catch(e) {
		throw(e)
	}
	
}

module.exports = fileCopy


/*const fs = require('fs');

fs.copyFile('hello', 'world', (err) => {
  if (err) throw err;
  console.log('copy success')
});*/

/*fs.readdir(process.cwd(), function(err, files) {
  if (err) {
  	throw err
  	process.exit(1)
  }
  console.log(files)
})*/

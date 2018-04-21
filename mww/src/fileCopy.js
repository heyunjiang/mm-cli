const fs = require('fs');

fs.copyFile('hello', 'world', (err) => {
  if (err) throw err;
  console.log('copy success')
});

/*fs.readdir(process.cwd(), function(err, files) {
  if (err) {
  	throw err
  	process.exit(1)
  }
  console.log(files)
})*/

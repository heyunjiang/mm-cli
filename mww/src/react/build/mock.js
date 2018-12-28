const path = require('path');

const mock = []
let fileArray = require('fs').readdirSync(path.resolve(__dirname, '..', 'src/mock'));
fileArray.forEach(function(file) {
	mock.push(path.resolve(__dirname, '../src/mock/', file))
})
module.exports = mock

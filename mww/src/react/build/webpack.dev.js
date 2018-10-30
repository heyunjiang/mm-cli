const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
	plugins: common.plugins.concat([
 		new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.SourceMapDevToolPlugin()
 	]),
	devServer: {
	    // contentBase: path.join(__dirname, '..', "dist"),
	    compress: true,
	    port: 9000,
	    hot: true,
	    host: 'localhost',
	    open: true
	},
	mode: 'development'
})
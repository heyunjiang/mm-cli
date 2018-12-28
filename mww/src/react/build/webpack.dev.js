const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path');
const mock = require('./mock.js');
const apiMocker = require('mocker-api');

module.exports = merge(common, {
	plugins: common.plugins.concat([
 		new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.SourceMapDevToolPlugin(),
    new webpack.DefinePlugin({
	    'process.env.NODE_ENV': JSON.stringify('development'),
	  })
 	]),
	devServer: {
	    // contentBase: path.join(__dirname, '..', "dist"),
	    compress: true,
	    port: 9000,
	    hot: true,
	    host: 'localhost',
	    open: true,
	    before(app){
  			apiMocker(app, mock)
			}
	},
	mode: 'development'
})
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
	// devtool: 'inline-source-map',
	plugins: common.plugins.concat([
 		new webpack.NamedModulesPlugin(),
    	new webpack.HotModuleReplacementPlugin(),
    	new HtmlWebpackPlugin({
	      template: 'src/index.html',
	      title: 'Development',
	      filename: 'index.html',
	      inject: true
	    })
 	]),
	devServer: {
	    contentBase: path.join(__dirname, "dist"),
	    compress: true,
	    port: 9000,
	    hot: true,
	    host: '0.0.0.0'
	    /*proxy: {
	    	"/wxservice/": {
	    		"target": "http://10.115.0.134/wxservice/",
	    		"changeOrigin": true,
	    		"pathRewrite": { "^/wxservice/" : "" }
	    	}
	    }*/
	},
	mode: 'development'
})
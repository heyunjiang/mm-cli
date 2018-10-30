const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(common, {
	plugins: common.plugins.concat([
 		new webpack.DefinePlugin({
	    'process.env.NODE_ENV': JSON.stringify('production') //在生产环境中使用此条，可以有效减少react打包后的体积
	  }),
	  new CleanWebpackPlugin([path.resolve(__dirname, '..', 'dist')], {
			allowExternal: true
		}),
 	]),
  optimization: {
    minimizer: [
      new UglifyJsPlugin() // 不要在开发环境中使用这个插件
    ]
  },
 	mode: 'production'
});
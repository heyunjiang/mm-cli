const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackTemplate = require('html-webpack-template')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const outputPath = path.resolve(__dirname, '..', 'dist');

module.exports = {
  entry: {
    'app': './src/index.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: `!!ejs-loader!${HtmlWebpackTemplate}`,
        filename: 'index.html',
        hash: true,
        mobile: true,
        title: 'mww',
        inject: false,
        appMountId: 'app',
        minify: {
          collapseWhitespace: true,
        },
        meta: [
          {
            name: 'description',
            content: 'mww',
          }
        ],
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/public',
        to: outputPath+'/public',
      }
    ]),
  ],
  module: {
    rules: [
      { 
        test: /\.js$/, 
        exclude: /node_modules/, 
        include: path.join(__dirname, '..', 'src'),
        loader: "babel-loader" 
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', {
          loader: 'css-loader', options: {
            importLoaders: 1,
            modules: true,
            localIdentName: '[local]___[hash:base64:5]'
          }
        } ]
      },
      {
        test: /\.less$/,
        include: path.join(__dirname, '..', 'src'),
        use: [ 'style-loader', {
          loader: 'css-loader', options: {
            importLoaders: 1,
            modules: true,
            localIdentName: '[local]___[hash:base64:5]'
          }
        }, {
          loader: 'less-loader', options: {
            javascriptEnabled: true
          }
        } ]
      },
      {
        test: /\.less$/,
        include: /node_modules/,
        use: [ 'style-loader', 'css-loader', {
          loader: 'less-loader', options: {
            javascriptEnabled: true,
            modifyVars: {
              'font-family': '"Microsoft Yahei", "AvenirNext-Regular", "Helvetica Neue", "lucida grande", "PingFangHK-Light", "STHeiti", "Heiti SC", "Hiragino Sans GB", "Microsoft JhengHei", SimHei, "WenQuanYi Micro Hei", "Droid Sans", "Roboto", Helvetica, Tahoma, Arial, "sans-serif"',
              'font-size-base': '12px'
            }
          }
        } ]
      },
      {
        test: /\.pdf$/,
        exclude: /node_modules/, 
        include: path.join(__dirname, '..', 'src'),
        use: [{loader: 'file-loader', options: {}}]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        include: path.join(__dirname, '..', 'src'),
        options: {
          limit: 10000
        }
      }
    ]
  },
  output: {
    path: outputPath,
    filename: '[name].[hash].js'
  },
  resolve: {
    extensions: ['.js', '.json', '.less']
  }
}
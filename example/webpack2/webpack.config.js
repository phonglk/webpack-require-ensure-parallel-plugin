var webpack = require('webpack');
var path = require('path');
var RequireEnsureParallelPlugin = require('../lib/RequireEnsureParallelPlugin');

var config = {
  entry: {
    app: './src/entry',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'src')
        ],
        loader: 'babel-loader',
        options: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['manifest'], // Specify the common bundle's name.
    }),
    new RequireEnsureParallelPlugin(),
  ],
}

module.exports = config;
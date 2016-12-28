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
    publicPath: '/dist/',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel?presets[]=es2015'
      }
    ]
  },
  resolve: {
    root: [
      path.resolve('./src'),
      path.resolve('../node_modules'),
    ],
    extensions: ['','.js']
  },
  resolveLoader: {
		root: [
      path.join(__dirname, "../node_modules"),
    ]
  },
  plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['manifest'], // Specify the common bundle's name.
    }),
    new RequireEnsureParallelPlugin()
  ],
}

module.exports = config;
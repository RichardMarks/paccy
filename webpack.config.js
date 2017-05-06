const path = require('path')
const webpack = require('webpack')

const DEBUG = process.env.NODE_ENV === 'production'

module.exports = {
  entry: path.resolve('./src/index.js'),
  output: {
    filename: 'main.js',
    path: path.resolve('./dist')
  },
  plugins: DEBUG
    ? [
      new webpack.optimize.UglifyJsPlugin()
    ]
    : [],
  devServer: {
    publicPath: '/',
    contentBase: [path.resolve('./dist'), path.resolve('./src')],
    compress: true,
    overlay: true
  }
}

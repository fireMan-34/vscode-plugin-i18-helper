const { join } = require('path');
const { cwd } = require('process');
const HtmlPlugin = require('html-webpack-plugin');

/** @type {import('webpack').Configuration} */
const webpackConfig = {
  mode: 'production',
  devtool: 'source-map',
  entry: join(__dirname, './pages/main.tsx'),
  output: {
    filename: 'main.js',
    path: join(cwd(), 'out'),
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        loader: 'ts-loader',
      },
    ]
  },
  plugins: [
    new HtmlPlugin({
      title: 'index.html',
      template: join(__dirname, './templates/index.html'),
      cache: true,
      publicPath: '.'
    }),
  ]
};

module.exports = webpackConfig;
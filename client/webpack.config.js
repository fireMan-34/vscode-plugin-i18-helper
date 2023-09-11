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
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
      },
    ]
  },
  plugins: [
    new HtmlPlugin({
      title: 'index.html',
      template: join(__dirname, './templates/index.html'),
      cache: true,
      // publicPath: '.'
    }),
  ],
  resolve: {
    // 修复解析相对模块
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  },
  cache: {
    type: 'filesystem',
  },
};

module.exports = webpackConfig;
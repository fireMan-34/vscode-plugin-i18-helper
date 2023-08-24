const { join } = require('path');
const { cwd } = require('process');

/** @type {import('webpack').Configuration} */
const webpackConfig = {
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  devtool: 'source-map',
  entry: join(__dirname, './src/extension.ts'),
  resolve: {
    alias: {
      commands: join(__dirname, './src/commands'),
      utils: join(__dirname, './src/utils/'),
    },
    extensions: [ ".ts", '.js' , ".json" ]
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  output: {
    filename: 'extension.js',
    path: join(cwd(), 'out'),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.(ts?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
  ],
};

module.exports = [ webpackConfig ];
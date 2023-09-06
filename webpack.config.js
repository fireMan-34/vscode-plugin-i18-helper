const { join } = require('path');
const { cwd } = require('process');
const { DllPlugin, } = require('webpack');

const OUT_PATH = join(cwd(), 'out');

/** @type {import('webpack').Configuration} */
const webpackConfig = {
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  devtool: 'source-map',
  entry: join(__dirname, './src/extension.ts'),
  resolve: {
    alias: {
      commands: join(__dirname, './src/commands'),
      utils: join(__dirname, './src/utils'),
      types: join(__dirname, './src/types'),
      constants: join(__dirname, './src/constants'),
      providers: join(__dirname, './src/providers'),
      models: join(__dirname, './src/models'),
    },
    extensions: [ ".ts", '.js' , ".json" ]
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  output: {
    filename: 'extension.js',
    path: OUT_PATH,
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.(ts|js|json)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
    // new DllPlugin({ format: true, path: OUT_PATH }),
  ],
  cache: {
    /** 文件编译缓存加速 这个真的顶 d=====(￣▽￣*)b */
    type: 'filesystem'
  }
};

module.exports = [ webpackConfig ];
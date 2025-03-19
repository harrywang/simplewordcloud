const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/browser.ts',
  output: {
    filename: 'simplewordcloud.min.js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: 'SimpleWordCloud',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify"),
      "string_decoder": require.resolve("string_decoder/"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "process": require.resolve("process/browser"),
      "crypto": false,
      "os": false,
      "child_process": false,
      "http": false,
      "https": false,
      "net": false,
      "tls": false,
      "zlib": false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
};

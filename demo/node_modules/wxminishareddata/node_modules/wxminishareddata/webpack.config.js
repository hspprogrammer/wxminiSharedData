const path = require('path');
const pkg = require("./package.json");

module.exports = {
  mode: "production",
  experiments: {
    outputModule: true,
  },
  entry: './src/index.js',
  output: {
    filename: pkg.main,
    library: {
      type: 'module',
    },
    path: path.resolve(__dirname, './'),
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          "plugins": ["@babel/plugin-external-helpers"]
        },
      },
    }, ]
  }
};
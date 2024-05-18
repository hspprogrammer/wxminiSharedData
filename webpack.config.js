const path = require('path');
const pkg = require("./package.json");

module.exports = {
  mode: "production",
  experiments: {
    outputModule: true,
  },
<<<<<<< HEAD
  entry: './src/index.js',
=======
  entry: './src/index.ts',
>>>>>>> 4194d93de785176dbeb181776869e480a17d9909
  output: {
    filename: pkg.main,
    library: {
      type: 'module',
    },
    path: path.resolve(__dirname, './'),
  },
<<<<<<< HEAD
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
=======
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules|demo)/,
>>>>>>> 4194d93de785176dbeb181776869e480a17d9909
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          "plugins": ["@babel/plugin-external-helpers"]
        },
      },
<<<<<<< HEAD
=======
    }, {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /(node_modules|demo)/,
>>>>>>> 4194d93de785176dbeb181776869e480a17d9909
    }, ]
  }
};
const path = require("path");
const pkg = require("./package.json");
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: isProduction ? false : "cheap-source-map",
  experiments: {
    outputModule: true,
  },
  entry: "./src/index.ts",
  output: {
    filename: pkg.main,
    library: {
      type: "module",
    },
    path: path.resolve(__dirname, "./"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|demo)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-external-helpers"],
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /(node_modules|demo)/,
      },
    ],
  },
};

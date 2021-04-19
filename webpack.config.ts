import * as path from 'path';
import * as webpack from 'webpack';

const config: webpack.Configuration = {
  mode: "development",
  entry: "./index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js',],
    alias: {
      "@src/**": path.resolve(__dirname, "src"),
    }
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "ndarray.bundle.js",
    library: "ndarray",
    libraryTarget: "umd",
  },
};

export default config;

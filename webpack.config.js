const path = require("path");

module.exports = {
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
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "ndarray.bundle.js",
        library: "ndarray",
        libraryTarget: "umd",
    },
    // devServer: {
    //     contentBase: path.join(__dirname, "dist"),
    //     compress: true,
    //     port: 8080,
    // },
    // experiments: {
    //     outputModule: true,
    //     syncWebAssembly: true,
    //     topLevelAwait: true,
    //     asyncWebAssembly: true,
    // }
};

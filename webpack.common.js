const path = require("path");
const JsDocPlugin = require('jsdoc-webpack-plugin');

module.exports = {
    entry: "./main.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "ndarray.bundle.js", 
        library: "ndarray",
        libraryTarget: "umd",
    },
    plugins: [
        new JsDocPlugin({
            conf: 'jsdoc.conf.js',
            cwd: '.',
            preserveTmpFile: false,
            recursive: false
        })
    ]
}

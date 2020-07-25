const path = require("path");

module.exports = {
    entry: "./main.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "ndarray.bundle.js", 
        library: "ndarray",
        libraryTarget: "umd",
    },
}

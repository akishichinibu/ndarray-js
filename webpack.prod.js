const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge.merge(common, {
    mode: "production",
    output: {
        filename: "ndarray.bundle.min.js", 
    }
});

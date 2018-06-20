const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    output: {
        // filename: "bundle.js"
        path: path.join(__dirname, './dist'),
        filename: 'bundle.js',
        library: 'conseiljs',
        libraryTarget: 'umd'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    node: {
        // handle "Can't resolve 'fs'" issue
        fs: 'empty'
    },
    plugins: [
        new UglifyJsPlugin()
    ]
};
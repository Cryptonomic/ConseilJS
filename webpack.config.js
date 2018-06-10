const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js"
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
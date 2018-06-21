const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    output: {
        // filename: "bundle.js"
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
        library: 'conseiljs',
        libraryTarget: 'umd'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"],
        plugins: [
            new TsConfigPathsPlugin({
                configFile: './tsconfig.json',
            }),
        ],
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' }
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
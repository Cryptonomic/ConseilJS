const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    target: 'node',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
        library: 'conseiljs',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        plugins: [
            new TsConfigPathsPlugin({
                configFile: './tsconfig.json',
            }),
        ],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' }
        ]
    },
    externals: [nodeExternals()],
    plugins: [
        new UglifyJsPlugin()
    ]
};
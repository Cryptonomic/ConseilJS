const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = {
    mode: 'production',
    devtool: 'inline-source-map',
    entry: './src/index-browser.ts',
    output: {
        // filename: "bundle.js"
        path: path.resolve(__dirname, './dist'),
        filename: 'conseil.min.js',
        library: 'conseiljs',
        libraryTarget: 'umd'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [
            new TsConfigPathsPlugin({
                configFile: './tsconfig.json'
            })
        ]
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' }
        ]
    },
    node: {
        // handle "Can't resolve 'fs'" issue
        fs: 'empty', child_process: 'empty'
    },
    plugins: [
        new UglifyJsPlugin(),
        new CheckerPlugin()
    ]
};

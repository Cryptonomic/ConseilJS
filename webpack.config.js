const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = {
    mode: 'development',
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
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' }
        ]
    },
    externals: [nodeExternals()],
    plugins: [
        new UglifyJsPlugin(),
        new CheckerPlugin()
    ]
};

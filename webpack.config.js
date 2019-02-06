const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');

const webConfig = {
    mode: 'production',
    entry: './src/index-web.ts',
    target: 'web',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'conseiljs.web.js',
        library: 'conseiljs-web',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
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
    node: {
        child_process: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
    plugins: [new UglifyJsPlugin(), new CheckerPlugin()],
}

module.exports = [webConfig];

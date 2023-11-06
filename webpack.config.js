const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const webConfig = {
    mode: 'production',
    entry: './src/index-web.ts',
    target: 'web',
    output: {
        path: path.resolve(__dirname, './dist-web'),
        filename: 'conseiljs.min.js',
        library: 'conseiljs',
        libraryTarget: 'umd',
        hashFunction: "sha256"
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [
            new TsConfigPathsPlugin({
                configFile: './tsconfig.json'
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    node: {

    },
    optimization: {
        minimizer: [new TerserPlugin()]
    }
};

module.exports = [webConfig];

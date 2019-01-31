const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const nodeExternals = require('webpack-node-externals');

const nodeConfig = {
    mode: "production",
    entry: "./src/index.ts",
    target: 'node',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'conseiljs.node.js',
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

const webConfig = {
    mode: "production",
    entry: "./src/index-web.ts",
    target: 'web',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'conseiljs.web.js',
        library: 'conseiljs-web',
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
    node: {
        child_process: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
    plugins: [new UglifyJsPlugin()],
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
   }
}

module.exports = [nodeConfig, webConfig];

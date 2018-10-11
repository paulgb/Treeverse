var webpack = require('webpack');
const path = require('path');

module.exports = {
    context: path.resolve('src'),
    entry: {
        '/extension/resources/script/background': './background/browser_action.ts',
        '/extension/resources/script/viewer': './viewer/main.ts',
    },
    output: {
        filename: '[name].js',
        path: __dirname
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            {
                test: /.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    mode: 'development'
}
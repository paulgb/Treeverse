var webpack = require('webpack');
const path = require('path');

module.exports = {
    context: path.resolve('src'),
    entry: {
        background: './background/browser_action.ts',
        viewer: './viewer/main.ts'
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/extension/resources/script'
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
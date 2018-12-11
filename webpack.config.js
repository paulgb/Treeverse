var webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: path.resolve('src'),
    entry: {
        '/extension_chrome/resources/script/background': './background/chrome_action.ts',
        '/extension_firefox/resources/script/background': './background/firefox_action.ts',
        '/extension_common/resources/script/viewer': './viewer/main.ts',
        '/public/treeverse': './viewer/web_entry.ts',
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
    plugins: [
        new CopyWebpackPlugin([
            {
                context: '../',
                from: 'web',
                to: 'public'
            }
        ]),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'web'),
        compress: true,
        port: 9000,
        historyApiFallback: {
            index: 'view/index.html'
        }
    },
    mode: 'development'
}
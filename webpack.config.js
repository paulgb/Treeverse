var webpack = require('webpack');
const path = require('path');

module.exports = {
    context: path.resolve('src'),
    entry: {
        '/extension_chrome/resources/script/background': './background/chrome_action.ts',
        '/extension_firefox/resources/script/background': './background/firefox_action.ts',
        '/extension_common/resources/script/viewer': './viewer/main.ts',
        '/web/treeverse': './viewer/web_entry.ts',
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
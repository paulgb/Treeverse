const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: path.resolve('src'),
    entry: {
        '/extension_chrome/resources/script/background': './background/chrome_action.ts',
        '/extension_chrome/resources/script/viewer': './viewer/main.ts',
        '/extension_chrome/resources/script/content': './content/main.ts',
        '/extension_firefox/resources/script/background': './background/firefox_action.ts',
        '/extension_firefox/resources/script/viewer': './viewer/main.ts',
        '/extension_firefox/resources/script/content': './content/main.ts',
        '/public/treeverse': './viewer/web_entry.ts',
    },
    output: {
        filename: '[name].js'
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
            // Web site
            {
                context: '../',
                from: 'web',
                to: 'public'
            },
            {
                context: '../',
                from: 'extension/common/resources/images',
                to: 'public/images'
            },
            {
                context: '../',
                from: 'images',
                to: 'public/images'
            },
            {
                context: '../',
                from: 'extension/common/icons',
                to: 'public/icons'
            },
            {
                context: '../',
                from: 'extension/common/resources/style.css',
                to: 'public/'
            },
            // Chrome extension
            {
                context: '../',
                from: 'extension/common',
                to: 'extension_chrome'
            },
            {
                context: '../',
                from: 'extension/chrome/manifest.json',
                to: 'extension_chrome'
            },
            // Firefox extension
            {
                context: '../',
                from: 'extension/common',
                to: 'extension_firefox/'
            },
            {
                context: '../',
                from: 'extension/firefox/manifest.json',
                to: 'extension_firefox/'
            },
        ]),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist/public'),
        compress: true,
        port: 9000,
        historyApiFallback: {
            index: 'view/index.html'
        }
    },
    mode: 'development'
}
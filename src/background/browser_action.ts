
function getUserAndTweetFromUrl(url: string): [string, string] {
    var parser = document.createElement('a');
    parser.href = url;
    if (parser.hostname != 'twitter.com') {
        return null;
    }
    let match = /\/(.+)\/status\/(\d+)/.exec(parser.pathname);
    if (match) {
        return [match[1], match[2]];
    }
}

chrome.browserAction.onClicked.addListener(
    function (tab: chrome.tabs.Tab) {
        let userTweetPair = getUserAndTweetFromUrl(tab.url);
        if (!userTweetPair) {
            return;
        }
        let [username, tweetId] = userTweetPair;

        let url = `resources/view.html#${username},${tweetId}`;
        chrome.tabs.create({ 'url': chrome.extension.getURL(url) });
    });


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

function sendMessageUntilReceived(tabId: number, message: any) {
    chrome.tabs.sendMessage(tabId, message, (response) => {
        if (!response) {
            sendMessageUntilReceived(tabId, message);
        }
    })
}

chrome.browserAction.onClicked.addListener(
    function (tab: chrome.tabs.Tab) {
        let userTweetPair = getUserAndTweetFromUrl(tab.url);
        if (!userTweetPair) {
            return;
        }
        let [username, tweetId] = userTweetPair;

        chrome.tabs.create({ 'url': chrome.extension.getURL('resources/view.html') }, (tab1: chrome.tabs.Tab) => {
            sendMessageUntilReceived(tab1.id, userTweetPair);
        });
    });

var background;
(function (background) {
    let matchTweetURL = 'https?://twitter.com/(.+)/status/(\\d+)';
    let matchTweetURLRegex = new RegExp(matchTweetURL);
    function getUserAndTweetFromUrl(url) {
        let match = matchTweetURLRegex.exec(url);
        if (match) {
            return [match[1], match[2]];
        }
    }
    chrome.pageAction.onClicked.addListener(function (tab) {
        let userTweetPair = getUserAndTweetFromUrl(tab.url);
        if (!userTweetPair) {
            return;
        }
        let [username, tweetId] = userTweetPair;
        let url = `resources/index.html#${username},${tweetId}`;
        chrome.tabs.create({ 'url': chrome.extension.getURL(url) });
    });
    chrome.runtime.onInstalled.addListener((callback) => {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
            chrome.declarativeContent.onPageChanged.addRules([
                {
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: {
                                urlMatches: matchTweetURL
                            }
                        })
                    ],
                    actions: [new chrome.declarativeContent.ShowPageAction()]
                }
            ]);
        });
    });
})(background || (background = {}));

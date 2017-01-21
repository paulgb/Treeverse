namespace background {
    let matchTweetURL = 'https?://twitter.com/(.+)/status/(\\d+)';
    let matchTweetURLRegex = new RegExp(matchTweetURL);

    function getUserAndTweetFromUrl(url: string): [string, string] {
        let match = matchTweetURLRegex.exec(url);
        if (match) {
            return [match[1], match[2]];
        }
    }

    chrome.pageAction.onClicked.addListener(
        function (tab: chrome.tabs.Tab) {
            let userTweetPair = getUserAndTweetFromUrl(tab.url);
            if (!userTweetPair) {
                return;
            }
            let [username, tweetId] = userTweetPair;

            let url = `resources/view.html#${username},${tweetId}`;
            chrome.tabs.create({ 'url': chrome.extension.getURL(url) });
        });

    chrome.runtime.onInstalled.addListener((callback) => {
        (<any>chrome).declarativeContent.onPageChanged.removeRules(undefined, () => {
            (<any>chrome).declarativeContent.onPageChanged.addRules([
                {
                    conditions: [
                        new (<any>chrome).declarativeContent.PageStateMatcher({
                            pageUrl: {
                                urlMatches: matchTweetURL
                            }
                        })
                    ],
                    actions: [new (<any>chrome).declarativeContent.ShowPageAction()]
                }
            ]);
        });
    });
}
namespace background {
    let matchTweetURL = 'https?://twitter.com/(.+)/status/(\\d+)';
    let matchTweetURLRegex = new RegExp(matchTweetURL);

    function getUserAndTweetFromUrl(url: string): [string, string] {
        let match = matchTweetURLRegex.exec(url);
        if (match) {
            return [match[1], match[2]];
        }
    }

    chrome.contextMenus.create({
        title: 'Archive Mode',
        contexts: ['page_action'],
        id: 'archive'
    })

    chrome.contextMenus.create({
        title: 'Help',
        contexts: ['page_action'],
        id: 'readme'
    })

    chrome.contextMenus.onClicked.addListener((info) => {
        if (info.menuItemId == 'archive') {
            let url = `resources/index.html`;
            chrome.tabs.create({ 'url': chrome.extension.getURL(url) });
        } else if (info.menuItemId == 'readme') {
            chrome.tabs.create({ 'url': 'https://github.com/paulgb/Treeverse/blob/master/README.md#readme' });
        }

    })

    chrome.pageAction.onClicked.addListener(
        function (tab: chrome.tabs.Tab) {
            let userTweetPair = getUserAndTweetFromUrl(tab.url);
            if (!userTweetPair) {
                return;
            }
            let [username, tweetId] = userTweetPair;

            let url = `resources/index.html#${username},${tweetId}`;
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
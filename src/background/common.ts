export let matchTweetURL = 'https?://(?:mobile\.)?twitter.com/(.+)/status/(\\d+)';
export let matchTweetURLRegex = new RegExp(matchTweetURL);

export function getUserAndTweetFromUrl(url: string): [string, string] {
    let match = matchTweetURLRegex.exec(url);
    if (match) {
        return [match[1], match[2]];
    }
}

export function clickAction(tab) {
    let userTweetPair = getUserAndTweetFromUrl(tab.url);
    if (!userTweetPair) {
        return;
    }
    let [username, tweetId] = userTweetPair;

    if (tab.url.match(/^https?:\/\/mobile\./)) {
        let newUrl = `https://twitter.com/${username}/status/${tweetId}`
        if (confirm("Treeverse can't be run from mobile.twitter.com, but we can redirect you to twitter.com.\n(You will have to click the Treeverse icon again there.)")) {
            chrome.tabs.update(tab.id, { url: newUrl });
        }
    } else {
        var indexUrl = chrome.extension.getURL(`resources`);

        chrome.tabs.executeScript(tab.id, {
            file: 'resources/script/viewer.js'
        }, () => {
            chrome.tabs.executeScript(tab.id, {
                code: `Treeverse.initialize(${JSON.stringify(indexUrl)}, ${JSON.stringify(username)}, ${JSON.stringify(tweetId)});`
            });
        });
    }
}
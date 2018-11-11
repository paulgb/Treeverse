import { matchTweetURL, clickAction } from './common';

chrome.pageAction.onClicked.addListener(clickAction);

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

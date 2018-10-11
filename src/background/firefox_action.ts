import { matchTweetURL, clickAction } from './common';

chrome.browserAction.onClicked.addListener(clickAction);

chrome.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    if (changeInfo.url.match(matchTweetURL)) {
        chrome.pageAction.show(tab.id);
    } else {
        chrome.pageAction.hide(tab.id);
    }
});

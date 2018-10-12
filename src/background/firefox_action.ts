import { matchTweetURL, clickAction } from './common';

chrome.pageAction.onClicked.addListener(clickAction);

chrome.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    if (changeInfo.url && changeInfo.url.match(matchTweetURL)) {
        chrome.pageAction.show(tab.id);
    } else {
        chrome.pageAction.hide(tab.id);
    }
});
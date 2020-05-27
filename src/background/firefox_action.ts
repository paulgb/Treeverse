import { matchTweetURL, clickAction, onMessageFromContentScript } from './common'

chrome.pageAction.onClicked.addListener(clickAction)

chrome.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    if (!changeInfo.url) {
        return
    } else if (changeInfo.url.match(matchTweetURL)) {
        chrome.pageAction.show(tab.id)
    } else {
        chrome.pageAction.hide(tab.id)
    }
})

chrome.runtime.onMessage.addListener(onMessageFromContentScript)

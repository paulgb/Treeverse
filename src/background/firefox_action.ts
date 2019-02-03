import { matchTweetURL, clickAction, updateAuth, onMessageFromContentScript } from './common'

chrome.pageAction.onClicked.addListener(clickAction)

chrome.webRequest.onBeforeSendHeaders.addListener((c) => {
    updateAuth(c.requestHeaders)
}, { urls: ['https://api.twitter.com/*'] },
['requestHeaders'])

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

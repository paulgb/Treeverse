import { matchTweetURL, clickAction, updateAuth } from './common'

chrome.pageAction.onClicked.addListener(clickAction)

chrome.webRequest.onBeforeSendHeaders.addListener((c) => {
    updateAuth(c.requestHeaders)
}, { urls: ['https://api.twitter.com/*'] },
    ['requestHeaders'])


chrome.runtime.onInstalled.addListener(() => {
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
        ])
    })
})

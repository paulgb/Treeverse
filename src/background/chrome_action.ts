import { matchTweetURL, clickAction, onMessageFromContentScript } from './common'

chrome.pageAction.onClicked.addListener(clickAction)

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

chrome.runtime.onMessage.addListener(onMessageFromContentScript)

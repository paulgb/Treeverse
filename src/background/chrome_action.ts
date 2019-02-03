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

chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.message === 'share') {
            fetch('https://1l8hy2eaaj.execute-api.us-east-1.amazonaws.com/default/treeverse_post', {
                method: 'POST',
                body: JSON.stringify(request.payload),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then((response) => response.text())
                .then((response) => chrome.tabs.create({ url: response }))
        }
    });

export let matchTweetURL = 'https?://(?:mobile\\.)?twitter.com/(.+)/status/(\\d+)'
export let matchTweetURLRegex = new RegExp(matchTweetURL)

// Stores auth and CSRF tokens once they are captured in the headers.
let auth = {
    csrfToken: null,
    authorization: null
}

// If we have to refresh the page to gather the headers, store the tab and
// tweet to load after we get the headers in this object.
let waiting = {
    tabId: null,
    tweetId: null
}

export function onMessageFromContentScript(request) {
    if (request.message === 'share') {
        // Handle share button click. The payload is the tree structure.

        fetch('https://1l8hy2eaaj.execute-api.us-east-1.amazonaws.com/default/treeverse_post', {
            method: 'POST',
            body: JSON.stringify(request.payload),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => response.text())
            .then((response) => chrome.tabs.create({ url: response }))
    }
}

export function updateAuth(headers) {
    for (let header of headers) {
        if (header.name.toLowerCase() == 'x-csrf-token') {
            auth.csrfToken = header.value
        } else if (header.name.toLowerCase() == 'authorization') {
            auth.authorization = header.value
        }
    }

    if (auth.authorization !== null && waiting.tabId !== null) {
        // If we previously reloaded the page in order to capture the tokens,
        // initiate Treeverse now.
        injectScripts(waiting.tabId, waiting.tweetId)
        waiting.tabId = null
        waiting.tweetId = null
    }
}

export function getTweetFromURL(url: string): string {
    let match = matchTweetURLRegex.exec(url)
    if (match) {
        return match[2]
    }
}

export function injectScripts(tabId: number, tweetId: string) {
    var indexUrl = chrome.extension.getURL('resources')
    chrome.tabs.executeScript(tabId, {
        file: 'resources/script/viewer.js'
    }, () => {
        chrome.tabs.executeScript(tabId, {
            code: `Treeverse.initialize(${JSON.stringify(indexUrl)}, ${JSON.stringify(tweetId)}, ${JSON.stringify(auth)});`
        })
    })
}

export function clickAction(tab) {
    let tweetId = getTweetFromURL(tab.url)
    let tabId = tab.id

    if (auth.authorization === null) {
        // If authorization hasn't been captured yet, we need to reload
        // the page to do so.
        waiting.tabId = tabId
        waiting.tweetId = tweetId
        chrome.tabs.reload(tab.id)
    } else {
        injectScripts(tabId, tweetId)
    }
}
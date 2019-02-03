export let matchTweetURL = 'https?://(?:mobile\\.)?twitter.com/(.+)/status/(\\d+)'
export let matchTweetURLRegex = new RegExp(matchTweetURL)

let auth = {
    csrfToken: null,
    authorization: null
}

export function updateAuth(headers) {
    for (let header of headers) {
        if (header.name.toLowerCase() == 'x-csrf-token') {
            auth.csrfToken = header.value
        } else if (header.name.toLowerCase() == 'authorization') {
            auth.authorization = header.value
        }
    }
}

export function getTweetFromURL(url: string): string {
    let match = matchTweetURLRegex.exec(url)
    if (match) {
        return match[2]
    }
}

export function clickAction(tab) {
    let tweetId = getTweetFromURL(tab.url)
    var indexUrl = chrome.extension.getURL('resources')

    if (auth.authorization === null) {
        alert('Couldn’t capture authorization key, try refreshing Twitter and attempting again.')
        return
    }

    chrome.tabs.executeScript(tab.id, {
        file: 'resources/script/viewer.js'
    }, () => {
        chrome.tabs.executeScript(tab.id, {
            code: `Treeverse.initialize(${JSON.stringify(indexUrl)}, ${JSON.stringify(tweetId)}, ${JSON.stringify(auth)});`
        })
    })
}
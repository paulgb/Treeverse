export let matchTweetURL = 'https?://(?:mobile\\.)?twitter.com/(.+)/status/(\\d+)'
export let matchTweetURLRegex = new RegExp(matchTweetURL)

const tweetToLoad: {value?: string} = {}

export function onMessageFromContentScript(request, sender, _sendResponse) {
    switch (request.message) {
        case 'share':
            // Handle share button click. The payload is the tree structure.
            fetch('https://treeverse.app/share', {
                method: 'POST',
                body: JSON.stringify(request.payload),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then((response) => response.text())
                .then((response) => chrome.tabs.create({ url: response }))
            break;

        case 'ready':
            if (tweetToLoad.value) {
                launchTreeverse(sender.tab.id, tweetToLoad.value)
                tweetToLoad.value = null
            }
            
            break;
    }
}

export function launchTreeverse(tabId: number, tweetId: string) {
    chrome.tabs.sendMessage(tabId, {
        'action': 'launch',
        'tweetId': tweetId
    })
}

export function getTweetIdFromURL(url: string): string {
    let match = matchTweetURLRegex.exec(url)
    if (match) {
        return match[2]
    }
}

export async function injectScripts(tabId: number, tweetId: string) {
    let state = await new Promise((resolve) => {
        chrome.tabs.executeScript(tabId, {
            code: `(typeof Treeverse !== 'undefined') ? Treeverse.PROXY.state : 'missing'`
        }, resolve)
    })
    
    console.log('state', state)

    switch (state[0]) {
        case 'ready':
            launchTreeverse(tabId, tweetId)
            break;
        case 'listening':
        case 'waiting':
        case 'missing':
        default:
            console.log(`Treeverse in non-ready state ${state[0]}`)
            tweetToLoad.value = tweetId

            // Force the tab to reload.
            chrome.tabs.reload(tabId)

            // Ensure the tab loads.
            setTimeout(() => {
                if (tweetToLoad.value !== null) {
                    alert(`Treeverse was unable to access the tweet data needed to launch.

If you report this error, please mention that the last proxy state was ${state[0]}`)
                }
            }, 2000)
    }
}

export function clickAction(tab: chrome.tabs.Tab) {
    const tweetId = getTweetIdFromURL(tab.url)
    injectScripts(tab.id, tweetId)
}
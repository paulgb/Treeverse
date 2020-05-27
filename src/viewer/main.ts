import { VisualizationController } from './visualization_controller'
import { createPage } from './page'
import {ContentProxy} from './proxy'

/**
 * Contains entry points for bootstrapping the visualization for
 * different modes.
 */
export namespace Treeverse {
    export const PROXY = new ContentProxy()
    PROXY.inject()

    chrome.runtime.onMessage.addListener(
        function(request, _sender, _sendResponse) {
            var baseUrl = chrome.extension.getURL('resources')

            if (request.action === 'launch') {
                Treeverse.initialize(baseUrl, request.tweetId)
            }
        })

    export function initialize(baseUrl: string, tweetId: string) {
        fetch(baseUrl + '/index.html').then((response) => response.text()).then((html) => {
            let parser = new DOMParser()
            let doc = parser.parseFromString(html, 'text/html')

            let baseEl = doc.createElement('base')
            baseEl.setAttribute('href', baseUrl + '/resources')
            doc.head.prepend(baseEl)

            window.history.pushState('', '', '')

            window.addEventListener('popstate', function (e) {
                window.location.reload()
            })

            document.getElementsByTagName('head')[0].replaceWith(doc.head)
            document.getElementsByTagName('body')[0].replaceWith(doc.body)

            createPage(document.getElementById('root'))

            let controller = new VisualizationController(Treeverse.PROXY)
            controller.fetchTweets(tweetId)
        })
    }
}

(window as any).Treeverse = Treeverse
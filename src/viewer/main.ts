import { VisualizationController } from './visualization_controller'
import { createPage } from './page'
import { TweetServer } from './tweet_server'
import { AuthType } from '../common/util'
/**
 * Contains entry points for bootstrapping the visualization for
 * different modes.
 */
export namespace Treeverse {
    export function initialize(baseUrl: string, tweetId: string, auth: AuthType) {
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

            let server = new TweetServer(auth)
            let controller = new VisualizationController(server)

            controller.fetchTweets(tweetId)
        })
    }
}

(window as any).Treeverse = Treeverse
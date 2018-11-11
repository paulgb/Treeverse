import { VisualizationController } from './visualization_controller';
import { Tweet } from './tweet_parser';
import {createPage} from './page';

/**
 * Contains entry points for bootstrapping the visualization for
 * different modes.
 */
export namespace Treeverse {
    export function initialize(baseUrl, username, tweetId) {
        fetch(baseUrl + '/index.html').then((response) => response.text()).then((html) => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');

            let baseEl = doc.createElement('base');
            baseEl.setAttribute('href', baseUrl + '/resources');
            doc.head.prepend(baseEl);

            window.history.pushState('', '', '');

            window.addEventListener("popstate", function (e) {
                window.location.reload();
            });

            document.getElementsByTagName('head')[0].replaceWith(doc.head);
            document.getElementsByTagName('body')[0].replaceWith(doc.body);

            createPage(document.getElementById('root'));
            let controller = new VisualizationController();

            let rootTweet = new Tweet();
            rootTweet.username = username;
            rootTweet.id = tweetId;

            controller.fetchTweets(rootTweet);
        });
    }
}

(window as any).Treeverse = Treeverse;
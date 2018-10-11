/**
 * Contains entry points for bootstrapping the visualization for
 * different modes.
 */
namespace Treeverse {
    export function initialize(baseUrl, username, tweetId) {
        fetch(baseUrl + '/index.html').then((response) => response.text()).then((html) => {
            html = html.replace(/{base}/g, baseUrl);;

            document.open();
            document.write(html);
            document.close();

            window.history.pushState('', '', '');

            window.addEventListener("popstate", function (e) {
                window.location.reload();
            });

            let controller = new VisualizationController(document.getElementById('container'));

            let rootTweet = new Tweet();
            rootTweet.username = username;
            rootTweet.id = tweetId;

            controller.fetchTweets(rootTweet);
        });
    }
}
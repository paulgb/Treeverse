/**
 * Contains entry points for bootstrapping the visualization for
 * different modes.
 */
namespace Treeverse {
    export function initializeForExtension(container: HTMLElement, location: Location) {
        let [_, username, tweetId] = location.hash.match(/#(.+),(.+)/);

        let controller = new VisualizationController(document.getElementById('container'));
        controller.setResourceGetter(new ExtensionResourceGetter());

        let rootTweet = new Tweet();
        rootTweet.username = username;
        rootTweet.id = tweetId;

        controller.fetchTweets(rootTweet);
    }

    export function initializeForStaticData(container: HTMLElement, staticData: SerializedTweetNode) {
        let controller = new VisualizationController(document.getElementById('container'), true);
        let root = SerializedTweetNode.toTweetNode(staticData);
        controller.setInitialTweetData(root);
    }

    export function initializeForArchiveReader(container: HTMLElement) {
        let controller = new VisualizationController(document.getElementById('container'), true);
        controller.enableArchiveUpload();
    }
}
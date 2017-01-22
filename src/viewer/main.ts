namespace Treeverse {
    export function initializeForExtension(container: HTMLElement, location: Location) {
        let [_, username, tweetId] = location.hash.match(/#(.+),(.+)/);

        let controller = new VisualizationController(document.getElementById('container'));
        controller.setResourceGetter(new ExtensionResourceGetter());

        let rootTweet = new Tweet();
        rootTweet.username = username;
        rootTweet.id = tweetId;
        console.log(rootTweet);

        controller.fetchTweets(rootTweet);
    }

    export function initializeForStaticData(container: HTMLElement, staticData: SerializedTweetNode) {
        let controller = new VisualizationController(document.getElementById('container'), true);
        controller.setResourceGetter(new HTTPResourceGetter());
        let root = SerializedTweetNode.toTweetNode(staticData);
        controller.setInitialTweetData(root);
    }

    export function initializeForArchiveReader(container: HTMLElement) {
        // TODO: write this
    }
}
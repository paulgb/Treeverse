
namespace Treeverse {
    export let offlineData: SerializedTweetNode = undefined;

    export function setOfflineData(data: SerializedTweetNode) {
        offlineData = data;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (Treeverse.offlineData) {
        let root = SerializedTweetNode.toTweetNode(Treeverse.offlineData);

        let controller = new VisualizationController(document.getElementById('container'), true);
        controller.setInitialTweetData(root);
    } else {
        let [_, username, tweetId] = document.location.hash.match(/#(.+),(.+)/);

        let controller = new VisualizationController(document.getElementById('container'));

        let rootTweet = new Tweet();
        rootTweet.username = username;
        rootTweet.id = tweetId;

        controller.fetchTweets(rootTweet);
    }
});

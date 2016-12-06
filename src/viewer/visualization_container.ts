
class VisualizationController {
    tweetTree: TweetTree;
    vis: TweetVisualization;
    feed: FeedController;

    fetchTweets(tweet: Tweet) {
        let url = TweetServer.getUrlForTweet(tweet.username, tweet.id);

        TweetServer.requestTweets(url).then(this.loadTweets.bind(this));
    }

    loadTweets(result) {
        let doc = TweetServer.extractDocFromResponse(result);
        let context = TweetServer.parseTweetsFromHtml(doc);

        this.tweetTree.addTweetsFromContext(context);
        this.vis.setTreeData(this.tweetTree);
    }

    constructor(container: HTMLElement) {
        this.feed = new FeedController(document.getElementById('feed'));
        this.vis = new TweetVisualization(document.getElementById('tree'), this.feed);
        this.tweetTree = new TweetTree();
    }
}
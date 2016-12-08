
type PointNode = d3.HierarchyPointNode<AbstractTreeNode>;

class VisualizationController {
    tweetTree: TweetTree;
    vis: TweetVisualization;
    feed: FeedController;
    tmp: boolean;

    fetchTweets(tweet: Tweet, continuation?: string) {
        if (!continuation) {
            let url = TweetServer.getUrlForTweet(tweet.username, tweet.id);
            TweetServer.requestTweets(url).then(this.loadTweets.bind(this));
        } else {
            let url = TweetServer.getUrlForConversation(tweet.username, tweet.id, continuation);
            TweetServer.requestTweets(url).then(this.loadConversation.bind(this));
        }
    }

    loadTweets(result) {
        let context = TweetServer.parseTweetsFromHtml(result);

        this.tweetTree.addTweetsFromContext(context);

        this.vis.setTreeData(this.tweetTree);
    }

    loadConversation(result) {
        let context = TweetServer.parseTweetsFromConversationHTML(result);
        this.tweetTree.addTweetsFromContext(context);
    }

    constructor(container: HTMLElement) {
        this.feed = new FeedController(document.getElementById('feed'));
        this.vis = new TweetVisualization(document.getElementById('tree'), this.feed);
        this.vis.on('hover', (e: PointNode) => this.feed.setFeed(e));
        this.tweetTree = new TweetTree();
    }
}
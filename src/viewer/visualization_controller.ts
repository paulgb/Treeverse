type PointNode = d3.HierarchyPointNode<AbstractTreeNode>;

class VisualizationController {
    private tweetTree: TweetNode;
    private vis: TweetVisualization;
    private feed: FeedController;

    fetchTweets(tweet: Tweet) {
        TweetServer.requestTweets(tweet).then((context) => {
            this.tweetTree = TweetNode.createFromContext(context);
            this.vis.setTreeData(this.tweetTree);
        });
    }

    private expandNode(node: AbstractTreeNode) {
        console.log('node: ', node);
        if (node instanceof HasMoreNode) {
            this.expandNode(node.parent);

        } else if (node instanceof TweetNode) {
            if (node.continuation) {
                TweetServer
                    .requestContinuation(node.tweet, node.continuation)
                    .then((context) => {
                        node.addChildrenFromContext(context);
                        this.vis.setTreeData(this.tweetTree);
                    });
            } else {
                TweetServer
                    .requestTweets(node.tweet)
                    .then((context) => {
                        node.addChildrenFromContext(context);
                        this.vis.setTreeData(this.tweetTree);
                    });
            }

        }
    }

    constructor(container: HTMLElement) {
        this.feed = new FeedController(document.getElementById('feed'));
        this.vis = new TweetVisualization(document.getElementById('tree'), this.feed);
        this.vis.on('hover', this.feed.setFeed.bind(this.feed));
        this.vis.on('dblclick', this.expandNode.bind(this));
    }
}
type PointNode = d3.HierarchyPointNode<AbstractTreeNode>;

/**
 * The controller for the main tree visualization.
 */
class VisualizationController {
    private tweetTree: TweetNode;
    private vis: TweetVisualization;
    private feed: FeedController;
    private resourceGetter: ResourceGetter;
    private infoBox: InfoBox;

    fetchTweets(tweet: Tweet) {
        TweetServer.requestTweets(tweet).then((context) => {
            document.getElementsByTagName('title')[0].innerText =
                `${context.tweet.username} - "${context.tweet.bodyText}" in Treeverse`;

            this.setInitialTweetData(TweetNode.createFromContext(context));
        });
    }

    enableArchiveUpload() {
        this.infoBox.addUploadBox(this.setInitialTweetData.bind(this));
    }

    setInitialTweetData(root: TweetNode) {
        this.tweetTree = root;
        this.vis.setTreeData(root);
        this.vis.zoomToFit();
    }

    setResourceGetter(resourceGetter: ResourceGetter) {
        this.resourceGetter = resourceGetter;
        this.infoBox.addDownloadButton(this.downloadPage.bind(this));
    }

    downloadPage() {
        var offliner = new Offline(this.resourceGetter);

        var filename = prompt("What would you like to call the snapshot?", "treeverse.html");
        if (filename == null) {
            return;
        }
        if (!filename.endsWith('.html')) {
            filename += '.html';
        }

        offliner.createOfflineHTML(this.tweetTree).then((data) => {
            let blob = new Blob([data], { type: 'text/html' });
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('download', filename);
            downloadLink.setAttribute('href', window.URL.createObjectURL(blob));
            downloadLink.click();
        });
    }

    private expandNode(node: AbstractTreeNode) {
        if (node instanceof HasMoreNode) {
            this.expandNode(node.parent);

        } else if (node instanceof TweetNode) {
            if (node.continuation) {
                TweetServer
                    .requestContinuation(node.tweet, node.continuation)
                    .then((context) => {
                        node.addChildrenFromContext(context);
                        this.vis.setTreeData(this.tweetTree);
                        if (node.tweet.id == this.tweetTree.tweet.id) {
                            // Only adjust zoom if this is loading more replies to
                            // the root tweet.
                            this.vis.zoomToFit();
                        }
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

    constructor(container: HTMLElement, offline: boolean = false) {
        // TODO: container isn't used.
        this.feed = new FeedController(document.getElementById('feedContainer'));
        this.vis = new TweetVisualization(document.getElementById('tree'), this.feed);
        this.infoBox = new InfoBox(document.getElementById('infoBox'));
        this.vis.on('hover', this.feed.setFeed.bind(this.feed));
        if (!offline) {
            this.vis.on('dblclick', this.expandNode.bind(this));
        }

    }
}
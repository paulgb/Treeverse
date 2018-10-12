import { FeedController } from './feed_controller';
import { TweetVisualization } from './tweet_visualization';
import { Tweet } from './tweet_parser';
import { TweetNode, AbstractTreeNode, HasMoreNode } from './tweet_tree';
import { TweetServer } from './tweet_server';

export type PointNode = d3.HierarchyPointNode<AbstractTreeNode>;

/**
 * The controller for the main tree visualization.
 */
export class VisualizationController {
    private tweetTree: TweetNode;
    private vis: TweetVisualization;
    private feed: FeedController;

    fetchTweets(tweet: Tweet) {
        TweetServer.requestTweets(tweet).then((context) => {
            document.getElementsByTagName('title')[0].innerText =
                `${context.tweet.username} - "${context.tweet.bodyText}" in Treeverse`;

            this.setInitialTweetData(TweetNode.createFromContext(context));
        });
    }

    setInitialTweetData(root: TweetNode) {
        this.tweetTree = root;
        this.vis.setTreeData(root);
        this.vis.zoomToFit();
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

    constructor(container: HTMLElement) {
        // TODO: container isn't used.
        this.feed = new FeedController(document.getElementById('feedContainer'));
        this.vis = new TweetVisualization(document.getElementById('tree'), this.feed);
        this.vis.on('hover', this.feed.setFeed.bind(this.feed));
        this.vis.on('dblclick', this.expandNode.bind(this));
    }
}

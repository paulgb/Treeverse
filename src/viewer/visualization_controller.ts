import { FeedController } from './feed_controller';
import { TweetVisualization } from './tweet_visualization';
import { Tweet } from './tweet_parser';
import { TweetNode, TweetTree, AbstractTreeNode, HasMoreNode } from './tweet_tree';
import { TweetServer } from './tweet_server';
import { Toolbar } from './toolbar';
import { SerializedTweetNode } from './serialize';
import * as d3 from 'd3';

export type PointNode = d3.HierarchyPointNode<AbstractTreeNode>;

/**
 * The controller for the main tree visualization.
 */
export class VisualizationController {
    private tweetTree: TweetTree;
    private vis: TweetVisualization;
    private feed: FeedController;
    private toolbar: Toolbar;
    private server: TweetServer;

    fetchTweets(tweet: Tweet) {
        this.server.requestTweets(tweet).then((tweets) => {
            let tweetTree = new TweetTree(tweet.id, tweets);
            document.getElementsByTagName('title')[0].innerText =
                `${tweetTree.root.tweet.username} - "${tweetTree.root.tweet.bodyText}" in Treeverse`;

            this.setInitialTweetData(tweetTree);
        });
    }

    setInitialTweetData(tree: TweetTree) {
        this.tweetTree = tree;
        this.vis.setTreeData(tree.root);
        this.vis.zoomToFit();
    }

    private expandNode(node: AbstractTreeNode) {
        if (node instanceof HasMoreNode) {
            this.expandNode(node.parent);
        } else if (node instanceof TweetNode) {
            if (node.continuation) {
                this.server
                    .requestContinuation(node.tweet, node.continuation)
                    .then((context) => {
                        node.addChildrenFromContext(context);
                        this.vis.setTreeData(this.tweetTree.root);
                        if (node.tweet.id == this.tweetTree.root.tweet.id) {
                            // Only adjust zoom if this is loading more replies to
                            // the root tweet.
                            this.vis.zoomToFit();
                        }
                    });
            } else {
                this.server
                    .requestTweets(node.tweet)
                    .then((tweets) => {
                        this.tweetTree.addTweets(tweets)

                        this.vis.setTreeData(this.tweetTree.root);
                    });
            }

        }
    }

    shareClicked() {
        let value = SerializedTweetNode.fromTweetNode(this.tweetTree.root);
        console.log(value);
        let form = d3.select(this.toolbar.container)
            .append('form')
            .attr('method', 'post')
            .attr('action', 'https://1l8hy2eaaj.execute-api.us-east-1.amazonaws.com/default/treeverse_post');
        form.append('input')
            .attr('type', 'hidden')
            .attr('name', 'content')
            .attr('value', JSON.stringify(value));
        (form.node() as any).submit();
    }

    constructor(server: TweetServer, offline = false) {
        this.server = server;
        this.feed = new FeedController(document.getElementById('feedContainer'));
        this.vis = new TweetVisualization(document.getElementById('tree'));

        this.toolbar = new Toolbar(document.getElementById('toolbar'));
        if (!offline) {
            this.toolbar.addButton('Create shareable link', this.shareClicked.bind(this));
        }

        this.vis.on('hover', this.feed.setFeed.bind(this.feed));
        if (!offline) {
            this.vis.on('dblclick', this.expandNode.bind(this));
        }
    }
}

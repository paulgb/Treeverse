import { FeedController } from './feed_controller';
import { TweetVisualization } from './tweet_visualization';
import { Tweet } from './tweet_parser';
import { TweetNode, AbstractTreeNode, HasMoreNode } from './tweet_tree';
import { TweetServer } from './tweet_server';
import { Toolbar } from './toolbar';
import { SerializedTweetNode } from './serialize';
import * as d3 from 'd3';

export type PointNode = d3.HierarchyPointNode<AbstractTreeNode>;

/**
 * The controller for the main tree visualization.
 */
export class VisualizationController {
    private tweetTree: TweetNode;
    private vis: TweetVisualization;
    private feed: FeedController;
    private toolbar: Toolbar;

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

    shareClicked() {
        let value = SerializedTweetNode.fromTweetNode(this.tweetTree);
        console.log(value);
        let form = d3.select(this.toolbar.container)
            .append('form')
            .attr('method','post')
            .attr('action', 'https://1l8hy2eaaj.execute-api.us-east-1.amazonaws.com/default/treeverse_post');
        form.append('input')
            .attr('type','hidden')
            .attr('name','content')
            .attr('value',JSON.stringify(value));
        (form.node() as any).submit();
    }

    constructor() {
        this.feed = new FeedController(document.getElementById('feedContainer'));
        this.vis = new TweetVisualization(document.getElementById('tree'), this.feed);

        this.toolbar = new Toolbar(document.getElementById('toolbar'));
        this.toolbar.addButton('share', this.shareClicked.bind(this));
        this.toolbar.addButton('download', this.shareClicked.bind(this));

        this.vis.on('hover', this.feed.setFeed.bind(this.feed));
        this.vis.on('dblclick', this.expandNode.bind(this));
    }
}

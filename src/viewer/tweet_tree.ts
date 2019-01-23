import * as d3 from 'd3';
import { Tweet } from './tweet_parser';

/**
 * Base class for all tree nodes.
 */
export class AbstractTreeNode {
    /**
     * Children of this node, represented as a map from ids to
     * AbstractTreeNodes.
     */
    children: Map<String, AbstractTreeNode>;

    constructor() {
        this.children = new Map<String, AbstractTreeNode>();
    }

    /** Returns a unique ID for this node. */
    getId(): string {
        throw new Error('Not implemented');
    }

    /** Returns a d3 hierarchy for the tree rooted at this node. */
    toHierarchy() {
        return d3.hierarchy(this, (d: AbstractTreeNode) => Array.from(d.children.values()));
    }
}

/**
 * A tree node representing the existance of more nodes not yet loaded.
 */
export class HasMoreNode extends AbstractTreeNode {
    parent: TweetNode;
    continuation: string;

    constructor(parent: TweetNode, continuation: string) {
        super();
        this.parent = parent;
        this.continuation = continuation;
    }

    getId() {
        // Parent continuation string is used so that d3 sees this as a new
        // HasMoreNode when another HasMoreNode has exited on the same parent.
        return `${this.parent.getId()}_${this.continuation}`;
    }
}

export class TweetTree {
    root: TweetNode
    index: Map<string, TweetNode>

    constructor(rootTweetId: string, tweets: Tweet[]) {
        this.index = new Map()

        for (let tweet of tweets) {
            if (tweet.id == rootTweetId) {
                this.root = new TweetNode(tweet)
                this.index.set(tweet.id, this.root)
                break
            }
        }

        this.addTweets(tweets)
    }

    addTweets(tweets: Tweet[]) {
        tweets.sort((a, b) => parseInt(a.id) - parseInt(b.id));

        for (let tweet of tweets) {
            if (!this.index.has(tweet.id)) {
                let node = new TweetNode(tweet)
                if (tweet.parent && this.index.has(tweet.parent)) {
                    this.index.get(tweet.parent).children.set(tweet.id, node)
                } else {
                }
                this.index.set(tweet.id, node);
            }
        }
    }
}

/**
 * A tree node representing an individual tweet.
 */
export class TweetNode extends AbstractTreeNode {
    tweet: Tweet;
    hasMoreNodeId: string;
    continuation: string;
    fullyLoaded: boolean;

    constructor(tweet: Tweet) {
        super();
        this.tweet = tweet;
    }

    getId() {
        return this.tweet.id;
    }

    /**
     * Return false iff this tweet has more replies that we know about.
     */
    hasMore(): boolean {
        // The fully loaded flag takes precedence because sometimes the
        // reply count from twitter is greater than the number of tweets
        // we actually get back from the API. This is probably because of
        // replies from private accounts.
        if (this.fullyLoaded) return false;
        if (this.continuation) return true;
        return this.children.size < this.tweet.replies;
    }
}
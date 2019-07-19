import * as d3 from 'd3'
import { TweetSet, Tweet } from './tweet_parser'


export class TweetTree {
    root: TweetNode
    index: Map<string, TweetNode>

    private constructor() { }

    static fromTweetSet(tweetSet: TweetSet): TweetTree {
        let tree = new TweetTree()

        tree.index = new Map()
        let { tweets, rootTweet } = tweetSet

        for (let tweet of tweets) {
            if (tweet.id == rootTweet) {
                tree.root = new TweetNode(tweet)
                tree.index.set(tweet.id, tree.root)
                break
            }
        }

        tree.addTweets(tweetSet)

        return tree
    }

    static fromRoot(root: TweetNode) {
        let tree = new TweetTree()

        tree.root = root
        return tree
    }

    setCursor(tweetId: string, cursor: string) {
        this.index.get(tweetId).cursor = cursor
    }

    addTweets(tweetSet: TweetSet) {
        let count = 0
        let { tweets, rootTweet, cursor } = tweetSet

        tweets.sort((a, b) => parseInt(a.id) - parseInt(b.id))

        for (let tweet of tweets) {
            if (!this.index.has(tweet.id)) {
                count += 1
                let node = new TweetNode(tweet)
                if (tweet.parent && this.index.has(tweet.parent)) {
                    this.index.get(tweet.parent).children.set(tweet.id, node)
                }
                this.index.set(tweet.id, node)
            }
        }

        if (cursor) {
            this.index.get(rootTweet).cursor = cursor
        } else {
            this.index.get(rootTweet).fullyLoaded = true
        }
        return count
    }

    toHierarchy() {
        return d3.hierarchy(this.root, (d: TweetNode) => Array.from(d.children.values()))
    }
}

/**
 * A tree node representing an individual tweet.
 */
export class TweetNode {
    children: Map<String, TweetNode>;

    tweet: Tweet;
    cursor: string;
    fullyLoaded: boolean;

    constructor(tweet: Tweet) {
        this.children = new Map<String, TweetNode>()
        this.tweet = tweet
    }

    getId() {
        return this.tweet.id
    }

    /**
     * Return false iff this tweet has more replies that we know about.
     */
    hasMore(): boolean {
        // The fully loaded flag takes precedence because sometimes the
        // reply count from twitter is greater than the number of tweets
        // we actually get back from the API. This is probably because of
        // replies from private accounts.
        if (this.fullyLoaded) return false
        if (this.cursor) return true
        return this.children.size < this.tweet.replies
    }
}
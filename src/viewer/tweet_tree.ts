import * as d3 from 'd3'
import { Tweet } from './tweet_parser'


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
        tweets.sort((a, b) => parseInt(a.id) - parseInt(b.id))

        for (let tweet of tweets) {
            if (!this.index.has(tweet.id)) {
                let node = new TweetNode(tweet)
                if (tweet.parent && this.index.has(tweet.parent)) {
                    this.index.get(tweet.parent).children.set(tweet.id, node)
                }
                this.index.set(tweet.id, node)
            }
        }
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
import { Tweet } from './tweet_parser'
import { TweetNode } from './tweet_tree'

export class SerializedTweetNode {
    tweet: Tweet;
    children: SerializedTweetNode[] = [];

    static fromTweetNode(tn: TweetNode) {
        let stn = new SerializedTweetNode()
        stn.tweet = tn.tweet
        tn.children.forEach((v: TweetNode) => {
            stn.children.push(SerializedTweetNode.fromTweetNode(v))
        })
        return stn
    }

    static toTweetNode(obj) {
        let tweet = new Tweet()
        Object.assign(tweet, obj.tweet)
        let tn = new TweetNode(tweet);
        (<SerializedTweetNode[]>obj.children).forEach((child) => {
            tn.children.set(child.tweet.id, SerializedTweetNode.toTweetNode(child))
        })
        tn.fullyLoaded = true
        return tn
    }
}
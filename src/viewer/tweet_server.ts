import { TweetParser, TweetSet } from './tweet_parser'
import {ContentProxy} from './proxy'

function getUrlForTweetId(tweetId: string, cursor: string): string {
    let params = new URLSearchParams({
        include_reply_count: '1',
        tweet_mode: 'extended'
    })

    if (cursor !== null && cursor !== undefined) {
        params.set('cursor', cursor)
    }

    return `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?${params.toString()}`
}

/**
 * Interfaces with Twitter API server.
 */
export class TweetServer {
    constructor(private proxy: ContentProxy) { }

    /**
     * Requests the TweetContext for a given tweet and returns a promise. 
     */
    async requestTweets(tweetId: string, cursor: string): Promise<TweetSet> {
        let response = await this.asyncGet(tweetId, cursor)

        return TweetParser.parseResponse(tweetId, response as any)
    }

    async asyncGet(tweetId: string, cursor: string) {
        let url = getUrlForTweetId(tweetId, cursor);

        return this.proxy.delegatedFetch(url)
    }
}
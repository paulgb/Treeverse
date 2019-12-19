import { TweetParser, TweetSet } from './tweet_parser'

declare var content: any


/**
 * Interfaces with Twitter API server.
 */
export class TweetServer {
    csrfToken: string;
    authorization: string;

    /**
     * Requests the TweetContext for a given tweet and returns a promise. 
     */
    async requestTweets(tweetId: string, cursor: string): Promise<TweetSet> {
        //let url = this.getUrlForTweetId(tweetId, cursor)
        let response = await this.asyncGet(tweetId, cursor)

        return TweetParser.parseResponse(tweetId, response as any)
    }

    async asyncGet(tweetId: string, cursor: string) {
        return new Promise<Response>((resolve) => {
            chrome.runtime.sendMessage(
                { message: "read", tweetId, cursor },
                resolve);
        })
    }
}
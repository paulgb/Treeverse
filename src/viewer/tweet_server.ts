import { TweetParser, TweetSet } from './tweet_parser'

declare var content: any


/**
 * Interfaces with Twitter API server.
 */
export class TweetServer {
    csrfToken: string;
    authorization: string;

    constructor(csrfToken, authorization) {
        this.csrfToken = csrfToken
        this.authorization = authorization
    }

    /**
     * Requests the TweetContext for a given tweet and returns a promise. 
     */
    async requestTweets(tweetId: string, cursor: string): Promise<TweetSet> {
        let url = this.getUrlForTweetId(tweetId, cursor)
        let response = await this.asyncGet(url)

        return TweetParser.parseResponse(tweetId, response)
    }

    async asyncGet(url: string) {
        let fetch: (input: RequestInfo, init?: RequestInit) =>
            Promise<Response> = (typeof content === 'undefined') ? window.fetch : content.fetch

        return fetch(url, {
            credentials: 'include',
            headers: {
                'x-csrf-token': this.csrfToken,
                'authorization': this.authorization
            }
        }).then((x) => x.json()).catch((error) => {
            console.warn('Fetch failed: ', error) // eslint-disable-line no-console
            return ''
        })
    }

    getUrlForTweetId(tweetId: string, cursor: string): string {
        let params = new URLSearchParams({
            include_reply_count: '1',
            tweet_mode: 'extended'
        })

        if (cursor !== null && cursor !== undefined) {
            params.set('cursor', cursor)
        }

        return `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?${params.toString()}`
    }
}
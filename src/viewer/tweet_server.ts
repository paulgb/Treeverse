import { TweetParser, TweetContext, Tweet } from './tweet_parser';

declare var content: any;

/**
 * Interfaces with Twitter API server.
 */
export class TweetServer {
    csrfToken: string;
    authorization: string;

    constructor(csrfToken, authorization) {
        this.csrfToken = csrfToken;
        this.authorization = authorization;
    }

    /**
     * Requests the TweetContext for a given tweet and returns a promise. 
     */
    async requestTweets(tweet): Promise<Tweet[]> {
        let url = this.getUrlForTweet(tweet);
        let response = await this.asyncGet(url);

        console.log(response);

        return TweetParser.parseTweets(response);
    }

    /**
     * Requests the continued conversation for a given tweet and continuation
     * token, and returns a promise.
     */
    async requestContinuation(tweet, continuation): Promise<TweetContext> {
        console.log('requestContinuation not implemented yet');
        return null;
        /*
        let url = getUrlForConversation(tweet, continuation);
        let response = await asyncGet(url);
        return TweetParser.parseTweetsFromConversationHTML(response);
        */
    }

    async asyncGet(url: string) {
        let fetch = (typeof content === 'undefined') ? window.fetch : content.fetch;

        return fetch(url, {
            credentials: "include",
            headers: {
                "x-csrf-token": this.csrfToken,
                "authorization": this.authorization
            }
        }).then((x) => x.json()).catch((error) => {
            console.warn('Fetch failed: ', error);
            return '';
        });
    }

    getUrlForTweet(tweet: Tweet): string {
        return `https://api.twitter.com/2/timeline/conversation/${tweet.id}.json`;
    }
}
import { TweetParser, TweetContext, Tweet } from './tweet_parser';

/**
 * Interfaces with Twitter API server.
 */
export namespace TweetServer {
    /**
     * Requests the TweetContext for a given tweet and returns a promise. 
     */
    export async function requestTweets(tweet): Promise<TweetContext> {
        let url = getUrlForTweet(tweet);
        let response = await asyncGet(url);
        return TweetParser.parseTweetsFromHtml(response);
    }

    /**
     * Requests the continued conversation for a given tweet and continuation
     * token, and returns a promise.
     */
    export async function requestContinuation(tweet, continuation): Promise<TweetContext> {
        let url = getUrlForConversation(tweet, continuation);
        let response = await asyncGet(url);
        return TweetParser.parseTweetsFromConversationHTML(response);
    }

    async function asyncGet(url: string) {
        return window.fetch(url, {
            headers: {
                'x-overlay-request': 'true'
            }
        }).then((x) => x.text()).catch((error) => {
            console.warn('Fetch failed: ', error);
            return '';
        });
    }

    function getUrlForTweet(tweet: Tweet): string {
        return `https://twitter.com/${tweet.username}/status/${tweet.id}`;
    }

    function getUrlForConversation(tweet: Tweet, continuation: string): string {
        return `https://twitter.com/i/${tweet.username}/conversation/${tweet.id}?max_position=${continuation}`;
    }
}
/**
 * Interfaces with Twitter API server.
 */
namespace TweetServer {
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
        return new Promise<string>((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                let response = xhr.response;
                resolve(response)
            };
            xhr.open('GET', url, true);
            xhr.setRequestHeader('x-overlay-request', 'true');
            xhr.send();
        });
    }

    function getUrlForTweet(tweet: Tweet): string {
        return `https://twitter.com/${tweet.username}/status/${tweet.id}`;
    }

    function getUrlForConversation(tweet: Tweet, continuation: string): string {
        return `https://twitter.com/i/${tweet.username}/conversation/${tweet.id}?max_position=${continuation}`;
    }
}
class Tweet {
    username: string;
    name: string;
    bodyElement: HTMLElement;
    body: string;
    id: string;
    avatar: string;
    time: number;
}

class TweetContext {
    ancestors: Tweet[] = [];
    tweet: Tweet;
    descentants: Tweet[][] = [];
    continuation: string;
    has_more: boolean;
}

class TweetServer {
    private static async asyncGet(url: string) {
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

    static async requestTweets(tweet): Promise<TweetContext> {
        let url = TweetServer.getUrlForTweet(tweet.username, tweet.id);
        let response = await TweetServer.asyncGet(url);
        return TweetParser.parseTweetsFromHtml(response);
    }

    static async requestContinuation(tweet, continuation): Promise<TweetContext> {
        let url = TweetServer.getUrlForConversation(tweet.username, tweet.id, continuation);
        let response = await TweetServer.asyncGet(url);
        return TweetParser.parseTweetsFromConversationHTML(response);
    }

    static getUrlForTweet(handle: string, tweetId: string): string {
        return `https://twitter.com/${handle}/status/${tweetId}`;
    }

    static getUrlForConversation(handle: string, tweetId: string, continuation: string): string {
        return `https://twitter.com/i/${handle}/conversation/${tweetId}?max_position=${continuation}`;
    }
}
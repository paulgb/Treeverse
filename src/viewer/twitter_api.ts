
class Tweet {
    username: string;
    name: string;
    bodyElement: HTMLElement;
    body: string;
    // date
    id: string;
    avatar: string;
}

class TweetContext {
    ancestors: Tweet[] = [];
    tweet: Tweet;
    descentants: Tweet[][] = [];
    continuation: string;
    has_more: boolean;
}

class TweetServer {
    static async requestTweets(url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => resolve(xhr.response);
            xhr.open('GET', url, true);
            xhr.setRequestHeader('x-overlay-request', 'true');
            xhr.send();
        });
    }

    static extractDocFromResponse(response: string): Document {
        let obj = JSON.parse(response);
        let responseHtml = obj.page;
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');

        return doc;
    }

    static extractDocFromConversationResponse(response: string): Document {
        let obj = JSON.parse(response);
        let responseHtml = obj.descendants.items_html;
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');

        return doc;
    }

    static parseTweetsFromConversationHTML(response: string): TweetContext {
        let obj = JSON.parse(response); // TODO: clean up
        let doc = TweetServer.extractDocFromConversationResponse(response);

        let context = new TweetContext();
        context.descentants = this.parseDescendants(doc.getElementsByTagName('body')[0]);
        context.continuation = obj.descendants.min_position;
        context.has_more = obj.descendants.has_more_items;

        return context;
    }

    static parseDescendants(container: HTMLElement): Tweet[][] {
        let descendants = container.querySelectorAll('li.ThreadedConversation,div.ThreadedConversation--loneTweet');
        let result = <Tweet[][]>[];

        for (let i = 0; i < descendants.length; i++) {
            let child = <HTMLElement>descendants[i];
            result.push(this.parseTweetsFromStream(child));
        }

        return result;
    }

    static parseTweetsFromHtml(response: string): TweetContext {
        let doc = TweetServer.extractDocFromResponse(response);
        let tweetContext = new TweetContext();

        tweetContext.continuation = doc.querySelector('.replies-to .stream-container').getAttribute('data-min-position');
        if (tweetContext.continuation) {
            tweetContext.has_more = true;
        }

        let ancestorContainer = <HTMLElement>doc.getElementsByClassName('in-reply-to')[0];
        let mainTweetContainer = <HTMLElement>doc
            .getElementsByClassName('permalink-tweet-container')[0];
        let descendentsContainer = <HTMLElement>doc.getElementsByClassName('replies-to')[0];

        if (ancestorContainer) {
            tweetContext.ancestors = this.parseTweetsFromStream(ancestorContainer);
        }

        if (mainTweetContainer) {
            tweetContext.tweet = this.parseTweetsFromStream(mainTweetContainer)[0];
        }

        tweetContext.descentants = this.parseDescendants(descendentsContainer);

        return tweetContext;
    }

    static parseTweetsFromStream(streamContainer: HTMLElement): Tweet[] {
        let tweets = [];
        let tweetElements = streamContainer.getElementsByClassName('tweet');

        let nextChildren = [];
        for (let i = 0; i < tweetElements.length; i++) {
            let tweetElement = <HTMLElement>tweetElements[i];
            let tweet = new Tweet();

            tweet.username = tweetElement.getAttribute('data-screen-name');
            tweet.name = tweetElement
                .getElementsByClassName('fullname')[0].firstChild.textContent;
            tweet.bodyElement = <HTMLElement>tweetElement
                .getElementsByClassName('tweet-text')[0];
            tweet.body = tweetElement
                .getElementsByClassName('tweet-text')[0].textContent;
            tweet.id = tweetElement.getAttribute('data-tweet-id');
            tweet.avatar = tweetElement.getElementsByClassName('avatar')[0].getAttribute('src');

            tweets.push(tweet);
            nextChildren = [tweet.id];
        }
        return tweets;
    }

    static getUrlForTweet(handle: string, tweetId: string): string {
        return `https://twitter.com/${handle}/status/${tweetId}`;
    }

    static getUrlForConversation(handle: string, tweetId: string, continuation: string): string {
        return `https://twitter.com/i/${handle}/conversation/${tweetId}?max_position=${continuation}`;
    }
}

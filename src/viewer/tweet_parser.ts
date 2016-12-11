class Tweet {
    username: string;
    name: string;
    bodyElement: HTMLElement;
    body: string;
    id: string;
    avatar: string;
    time: number;
    replies: number;

    getUrl() {
        return `https://twitter.com/${this.username}/status/${this.id}`;
    }

    getUserUrl() {
        return `https://twitter.com/${this.username}`;
    }
}

class TweetContext {
    ancestors: Tweet[] = [];
    tweet: Tweet;
    descentants: Tweet[][] = [];
    continuation: string;
}

class TweetParser {
    private static extractDocFromResponse(response: string): Document {
        let obj = JSON.parse(response);
        let responseHtml = obj.page;
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');

        return doc;
    }

    private static extractDocFromConversationResponse(response: string): Document {
        let obj = JSON.parse(response);
        let responseHtml = obj.descendants.items_html;
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');

        return doc;
    }

    public static parseTweetsFromConversationHTML(response: string): TweetContext {
        let obj = JSON.parse(response);
        let doc = TweetParser.extractDocFromConversationResponse(response);

        let context = new TweetContext();
        context.descentants = this
            .parseDescendants(doc.getElementsByTagName('body')[0]);
        context.continuation = obj.descendants.min_position;

        return context;
    }

    private static parseDescendants(container: HTMLElement): Tweet[][] {
        let descendants = container
            .querySelectorAll('li.ThreadedConversation,div.ThreadedConversation--loneTweet');
        let result = <Tweet[][]>[];

        for (let i = 0; i < descendants.length; i++) {
            let child = <HTMLElement>descendants[i];
            result.push(this.parseTweetsFromStream(child));
        }

        return result;
    }

    static parseTweetsFromHtml(response: string): TweetContext {
        let doc = TweetParser.extractDocFromResponse(response);
        let tweetContext = new TweetContext();

        tweetContext.continuation = doc
            .querySelector('.replies-to .stream-container')
            .getAttribute('data-min-position');

        let ancestorContainer = <HTMLElement>doc
            .getElementsByClassName('in-reply-to')[0];
        let mainTweetContainer = <HTMLElement>doc
            .getElementsByClassName('permalink-tweet-container')[0];
        let descendentsContainer = <HTMLElement>doc
            .getElementsByClassName('replies-to')[0];

        if (ancestorContainer) {
            tweetContext.ancestors = this.parseTweetsFromStream(ancestorContainer);
        }

        if (mainTweetContainer) {
            tweetContext.tweet = this.parseTweetsFromStream(mainTweetContainer)[0];
        }

        tweetContext.descentants = this.parseDescendants(descendentsContainer);

        return tweetContext;
    }

    private static parseTweetsFromStream(streamContainer: HTMLElement): Tweet[] {
        let tweetStream = [];
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
            tweet.avatar = tweetElement
                .getElementsByClassName('avatar')[0].getAttribute('src');
            tweet.time = Number(tweetElement
                .getElementsByClassName('_timestamp')[0]
                .getAttribute('data-time-ms'));
            tweet.replies = Number(tweetElement
                .getElementsByClassName('js-actionReply')[0]
                .getElementsByClassName('ProfileTweet-actionCountForPresentation')[0]
                .textContent);

            tweetStream.push(tweet);
            nextChildren = [tweet.id];
        }

        return tweetStream;
    }
}
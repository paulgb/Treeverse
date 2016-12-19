/**
 * Contains information about an individual tweet.
 */
class Tweet {
    /** Unique identifier of the tweet. */
    id: string;
    /** Handle of user who posted tweet. */
    username: string;
    /** Screen name of user who posted tweet. */
    name: string;
    /** HTML body of the tweet content. */
    bodyHtml: string;
    bodyText: string;
    /** URL of the avatar image for the user who posted the tweet.  */
    avatar: string;
    /** Time of the tweet in milliseconds since epoch. */
    time: number;
    /** Number of replies (public and private) to the tweet. */
    replies: number;

    images: string[] = [];

    /**
     * Returns a URL to this tweet on Twitter.
     */
    getUrl() {
        return `https://twitter.com/${this.username}/status/${this.id}`;
    }

    /**
     * Returns a URL to the profile that posted this tweet on Twitter.
     */
    getUserUrl() {
        return `https://twitter.com/${this.username}`;
    }
}

/**
 * Represents the context of a conversation around a particular tweet. this
 * consists of the tweet itself, (some of) the tweets before it in its
 * reply-chain, and (some of) the reply chains that come after it.
 */
class TweetContext {
    /** Tweets before this.tweet in the reply-chain. */
    ancestors: Tweet[] = [];
    /** The tweet that this TweetContext relates to. */
    tweet: Tweet;
    /** Chains of replies in response to this.tweet. */
    descentants: Tweet[][] = [];
    /** If present, an API token used to loading more descendants. If absent,
     *  indicates no further replies. */
    continuation: string;
}

/**
 * Functions for parsing a response from the twitter API into Tweet and
 * TweetContext objects.
 */
namespace TweetParser {
    /**
     * Given an API response with a conversation continuation, parse and return 
     * the TweetContext.
     */
    export function parseTweetsFromConversationHTML(response: string): TweetContext {
        let obj = JSON.parse(response);
        let doc = extractDocFromConversationResponse(response);

        let context = new TweetContext();
        context.descentants = parseDescendants(doc.getElementsByTagName('body')[0]);
        context.continuation = obj.descendants.min_position;

        return context;
    }

    /**
     * Given an API response about a particular tweet, parse and return the 
     * TweetContext.
     */
    export function parseTweetsFromHtml(response: string): TweetContext {
        let doc = extractDocFromResponse(response);
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
            tweetContext.ancestors = parseTweetsFromStream(ancestorContainer);
        }

        if (mainTweetContainer) {
            tweetContext.tweet = parseTweetsFromStream(mainTweetContainer)[0];
        }

        tweetContext.descentants = parseDescendants(descendentsContainer);

        return tweetContext;
    }

    function parseDescendants(container: HTMLElement): Tweet[][] {
        let descendants = container
            .querySelectorAll('li.ThreadedConversation,div.ThreadedConversation--loneTweet');
        let result = <Tweet[][]>[];

        for (let i = 0; i < descendants.length; i++) {
            let child = <HTMLElement>descendants[i];
            result.push(parseTweetsFromStream(child));
        }

        return result;
    }

    function extractDocFromResponse(response: string): Document {
        let obj = JSON.parse(response);
        let responseHtml = obj.page;
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');

        return doc;
    }

    function extractDocFromConversationResponse(response: string): Document {
        let obj = JSON.parse(response);
        let responseHtml = obj.descendants.items_html;
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');

        return doc;
    }

    function parseTweetsFromStream(streamContainer: HTMLElement): Tweet[] {
        let tweetStream = [];
        let tweetElements = streamContainer.getElementsByClassName('tweet');

        let nextChildren = [];
        for (let i = 0; i < tweetElements.length; i++) {
            let tweetElement = <HTMLElement>tweetElements[i];
            let tweet = new Tweet();

            tweet.username = tweetElement.getAttribute('data-screen-name');
            tweet.name = tweetElement
                .getElementsByClassName('fullname')[0].innerHTML;
            tweet.bodyText = tweetElement
                .getElementsByClassName('tweet-text')[0].textContent;
            tweet.bodyHtml = tweetElement
                .getElementsByClassName('tweet-text')[0].innerHTML;
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

            for (let img of tweetElement.querySelectorAll('.AdaptiveMedia-photoContainer img')) {
                tweet.images.push(img.getAttribute('src'));
            }

            tweetStream.push(tweet);
            nextChildren = [tweet.id];
        }

        return tweetStream;
    }
}
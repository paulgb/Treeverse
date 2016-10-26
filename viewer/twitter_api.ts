
// High level: given a tweet ID, return a tree-like data structure

class Tweet {
    username: string;
    //children: string[];
    //bodyElement: HTMLElement;
    body: string;
    // date
    id: string;
}

class TweetContext {
    ancestors: Tweet[] = [];
    tweet: Tweet;
    descentants: Tweet[][] = [];
}

class TweetServer {
    static async fetchTweetContext(handle: string, tweetId: string) {
        let url = TweetServer.getUrlForTweet(handle, tweetId);
        let tweetsHtml = await TweetServer.requestTweets(url);
        let doc = TweetServer.extractDocFromResponse(tweetsHtml);
        return TweetServer.parseTweetsFromHtml(doc);
    }

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

    static parseTweetsFromHtml(doc: Document): TweetContext {
        let tweetContext = new TweetContext();

        let ancestorContainer = <HTMLElement>doc.getElementsByClassName('in-reply-to')[0];
        let mainTweetContainer = <HTMLElement>doc
            .getElementsByClassName('permalink-tweet-container')[0];
        let descendentsContainer = doc.getElementsByClassName('replies-to')[0]
            .querySelectorAll('li.ThreadedConversation,div.ThreadedConversation--loneTweet');

        if (ancestorContainer) {
            tweetContext.ancestors = this.parseTweetsFromStream(ancestorContainer); 
        }

        if (mainTweetContainer) {
            tweetContext.tweet = this.parseTweetsFromStream(mainTweetContainer)[0];
        }

        for (let i = 0; i < descendentsContainer.length; i++) {          
            let child = <HTMLElement>descendentsContainer[i];  
            tweetContext.descentants.push(this.parseTweetsFromStream(child));            
        }
        
        return tweetContext;
    }

    static parseTweetsFromStream(streamContainer: HTMLElement): Tweet[] {
        let tweets = [];
        let tweetElements = streamContainer.getElementsByClassName('tweet');

        let nextChildren = [];
        for (let i = 0; i < tweetElements.length; i++) {
            let tweetElement = <HTMLElement>tweetElements[i];
            let tweet = new Tweet();

            tweet.username = tweetElement
                .getElementsByClassName('fullname')[0].firstChild.textContent;
            tweet.body = tweetElement
                .getElementsByClassName('tweet-text')[0].textContent;
            tweet.id = tweetElement.getAttribute('data-tweet-id');
            
            tweets.push(tweet);
            nextChildren = [tweet.id];
        }
        return tweets;
    }

    static getUrlForTweet(handle: string, tweetId: string): string {
        return `https://twitter.com/${handle}/status/${tweetId}`;
    }
}

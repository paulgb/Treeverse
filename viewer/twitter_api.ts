

class Tweet {
    username: string;
    children: string[];
    //bodyElement: HTMLElement;
    body: string;
    // date
}

class TweetLoader {
    tweets: Map<string, Tweet> = new Map<string, Tweet>();

    async requestTweets(url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => resolve(xhr.response);
            xhr.open('GET', url, true);
            xhr.setRequestHeader('x-overlay-request', 'true');
            xhr.send();
        });
    }

    async requestAndParseTweets(url: string): Promise<Tweet[]> {
        let tweetJson = await this.requestTweets(url);

        //return tweets;
        return undefined;
    }

    processTweetResponse(response: string) {
        let obj = JSON.parse(response);
        let responseHtml = obj.page;
        //document.documentElement.innerHTML = responseHtml;

        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');

        let tweets = this.parseTweetsFromDocument(doc);
        console.log(tweets);
    }

    parseTweetsFromDocument(doc: Document): Tweet[] {
        let tweets = [];

        let ancestorContainer = <HTMLElement>doc.getElementsByClassName('in-reply-to')[0];
        let mainTweetContainer = <HTMLElement>doc
            .getElementsByClassName('permalink-tweet-container')[0];
        let descendentsContainer = doc.getElementsByClassName('replies-to')[0]
            .querySelectorAll('li.ThreadedConversation,div.ThreadedConversation--loneTweet');

        if (ancestorContainer) {
            tweets.push(...this.parseTweetsFromStream(ancestorContainer));
        }
        if (mainTweetContainer) {
            tweets.push(...this.parseTweetsFromStream(mainTweetContainer));
        }
        for (let i = 0; i < descendentsContainer.length; i++) {
            let child = <HTMLElement>descendentsContainer[i];
            console.log('child: ', child);
            tweets.push(...this.parseTweetsFromStream(child));
        }

        return tweets;
    }

    parseTweetsFromStream(streamContainer: HTMLElement,
        parent?: string, child?: string): Tweet[] {
        let tweets = [];
        let tweetElements = streamContainer.getElementsByClassName('tweet');

        for (let i = 0; i < tweetElements.length; i++) {
            let tweetElement = tweetElements[i];
            let handle = (<HTMLElement>tweetElement
                .getElementsByClassName('fullname')[0]).firstChild.textContent;
            let tweetText = (<HTMLElement>tweetElement
                .getElementsByClassName('tweet-text')[0]).textContent;

            let tweet = new Tweet();
            tweet.username = handle;
            tweet.body = tweetText;
            tweets.push(tweet);
        }
        return tweets;
    }

    public loadTweets(handle: string, tweetId: string) {
        let url = `https://twitter.com/${handle}/status/${tweetId}`;
        console.log('tweet url:', url);
        this.requestTweets(url);
    }

}

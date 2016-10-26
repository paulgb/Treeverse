
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    let [username, tweetId] = msg;
    
    let url = TweetLoader.getUrlForTweet(username, tweetId);
    TweetLoader.requestTweets(url).then((result) => {
        let extractedHtml = TweetLoader.extractDocHtmlFromResponse(result);
        document.documentElement.innerHTML = extractedHtml;
        let tweets = TweetLoader.parseTweetsFromHtml(extractedHtml);
        console.log(tweets);
    });

    response(true);
});
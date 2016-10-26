
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    let [username, tweetId] = msg;
    
    let url = TweetServer.getUrlForTweet(username, tweetId);
    TweetServer.requestTweets(url).then((result) => {
        let doc = TweetServer.extractDocFromResponse(result);
        document.documentElement.innerHTML = doc.documentElement.innerHTML;
        let context = TweetServer.parseTweetsFromHtml(doc);
        console.log(context);

        let tweetTree = new TweetTree();
        tweetTree.addTweetsFromContext(context);
        console.log(tweetTree);
    });

    response(true);
});

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    let [username, tweetId] = msg;

    let controller = new VisualizationController(document.getElementById('container'));

    let rootTweet = new Tweet();
    rootTweet.username = username;
    rootTweet.id = tweetId;

    controller.fetchTweets(rootTweet);

    response(true);
});
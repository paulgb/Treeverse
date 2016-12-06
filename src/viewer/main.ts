
document.addEventListener("DOMContentLoaded", () => {
    let [_, username, tweetId] = document.location.hash.match(/#(.+),(.+)/);

    let controller = new VisualizationController(document.getElementById('container'));

    let rootTweet = new Tweet();
    rootTweet.username = username;
    rootTweet.id = tweetId;

    controller.fetchTweets(rootTweet);
});

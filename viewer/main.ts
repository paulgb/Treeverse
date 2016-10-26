/// <reference path="twitter_api.ts"/>

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    let [username, tweetId] = msg;
    
    let tl = new TweetLoader();

    response(true);
});
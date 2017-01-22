namespace Archive {
    function escapeHTML(html: string) {
        let elem = document.createElement('div');
        elem.appendChild(document.createTextNode(html))
        return elem.innerHTML;
    }

    function parseTweet(tweetObject: any): [Tweet, string] {
        let tweet = new Tweet();
        let reply_to_id = tweetObject['in_reply_to_status_id_str'];

        tweet.avatar = tweetObject['user']['profile_image_url_https'];
        tweet.bodyHtml = escapeHTML(tweetObject['text']);
        tweet.bodyText = tweetObject['text'];
        tweet.id = tweetObject['id_str'];
        tweet.name = tweetObject['user']['name'];
        tweet.replies = 0; // not supported?
        tweet.username = tweetObject['user']['screen_name'];
        tweet.time = new Date(tweetObject['created_at']).getTime();
        return [tweet, reply_to_id];
    }

    export function parseTweetsFromArchive(archive: any[]) {
        let nodes = new Map<String, TweetNode>();

        let [rootTweet, _] = parseTweet(archive.shift());
        let rootNode = new TweetNode(rootTweet);
        nodes.set(rootTweet.id, rootNode);

        for (let arcTweet of archive) {
            let [tweet, parent] = parseTweet(arcTweet);
            if (!nodes.has(parent)) {
                alert('Orphaned tweet detected! See the readme for format details. Aborting.');
                return;
            }
            let parentNode = nodes.get(parent);
            let tweetNode = new TweetNode(tweet);
            parentNode.children.set(tweet.id, tweetNode);
            nodes.set(tweet.id, tweetNode);
        }
        return rootNode;
    }
}
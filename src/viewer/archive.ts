/**
 * Functions for dealing with twarc (https://github.com/DocNow/twarc) archives.
 */
namespace Archive {
    /**
     * Escape HTML special characters in the given string.
     */
    function escapeHTML(html: string) {
        let elem = document.createElement('div');
        elem.appendChild(document.createTextNode(html))
        return elem.innerHTML;
    }

    /**
     * Parse an object in the format of a Twitter API response into a
     * (Tweet, parent id) pair.
     */
    function parseTweet(tweetObject: any): [Tweet, string] {
        let tweet = new Tweet();
        let reply_to_id = tweetObject['in_reply_to_status_id_str'];

        tweet.avatar = tweetObject['user']['profile_image_url_https'];
        tweet.bodyHtml = escapeHTML(tweetObject['text']);
        tweet.bodyText = tweetObject['text'];
        tweet.id = tweetObject['id_str'];
        tweet.name = tweetObject['user']['name'];
        tweet.replies = 0; // Not available in archive data.
        tweet.username = tweetObject['user']['screen_name'];
        tweet.time = new Date(tweetObject['created_at']).getTime();
        return [tweet, reply_to_id];
    }

    /**
     * Create a TweetNode tree from a list where each element is a tweet
     * in Twitter API format.
     */
    export function parseTweetsFromArchive(archive: any[]) {
        let nodes = new Map<String, TweetNode>();
        let rootNode;

        archive.sort((o1, o2) => {
            return parseInt(o1.id) - parseInt(o2.id);
        });

        let parsedTweets = [];

        for (let i = 0; i < archive.length; i++) {
            let arcTweet = archive[i];
            let parseResult;
            try {
                parseResult = parseTweet(arcTweet);
            } catch (err) {
                let message = `Tweet with id ${arcTweet['id']} parses but missing field.`;
                alert(message + ' (see console)');
                console.log(message);
                console.log(err);
                console.log(arcTweet);
                return;
            }
            let [tweet, parent] = parseResult;
            let tweetNode = new TweetNode(tweet);
            nodes.set(tweet.id, tweetNode);

            if (i == 0) {
                rootNode = tweetNode;
            } else if (!nodes.has(parent)) {
                alert('Orphaned tweet detected! See the readme for format details. Aborting.');
                console.log('Orphaned tweet: ', arcTweet);
                return;
            } else {
                let parentNode = nodes.get(parent);
                parentNode.children.set(tweet.id, tweetNode);
            }
        }
        return rootNode;
    }

    export function parseTweetsFromFile(contents) {
        let lines = contents.split(/\r?\n/);
        lines.pop();

        let objects = [];
        for (let i = 0; i < lines.length; i++) {
            try {
                objects.push(JSON.parse(lines[i]));
            } catch (err) {
                let message = `Couldn't parse JSON on line ${i + 1}.`;
                alert(message + ' (see console)');
                console.log(message);
                console.log(err);
                console.log(lines[i]);
                return;
            }
        }
        let archiveData = lines.map(JSON.parse);
        let newRoot = Archive.parseTweetsFromArchive(archiveData);
        return newRoot;
    }
}
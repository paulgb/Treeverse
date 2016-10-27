
class TweetTree {
    idToTweet: Map<string, Tweet> = new Map<string, Tweet>();
    tweetIdToChildren: Map<string, Set<string>> = new Map<string, Set<string>>();

    addTweet(tweet: Tweet) {
        this.idToTweet.set(tweet.id, tweet);
    }

    addParent(parent: Tweet, child: Tweet) {
        if (!parent || !child) {
            return;
        }
        parent.children.push(child);
        if (!this.tweetIdToChildren.has(parent.id)) {
            this.tweetIdToChildren.set(parent.id, new Set([child.id]));
        }
        this.tweetIdToChildren.get(parent.id).add(child.id);
    }
    
    addTweetsFromContext(tweetContext: TweetContext) {
        let parent = null;
        for (let ancestor of tweetContext.ancestors) {
            this.addTweet(ancestor);
            this.addParent(parent, ancestor);
            parent = ancestor;
        }
        this.addTweet(tweetContext.tweet);
        this.addParent(parent, tweetContext.tweet);
        for (let descentantGroup of tweetContext.descentants) {
            parent = tweetContext.tweet;
            for (let descendent of descentantGroup) {
                this.addTweet(descendent);
                this.addParent(parent, descendent);
                parent = descendent;
            }
        }
    } 
}

class AbstractTreeNode {
    children: AbstractTreeNode[];

    constructor() {
        this.children = [];
    }
}

class TweetNode extends AbstractTreeNode {
    tweet: Tweet;

    constructor(tweet: Tweet) {
        super();
        this.tweet = tweet;
    }
}

class HasMoreNode extends AbstractTreeNode {
    parent: TweetNode;
    continuation: string;

    constructor(parent: TweetNode, continuation: string) {
        super();
        this.parent = parent;
        this.continuation = continuation;
    }
}

class TweetTree {
    root: AbstractTreeNode;

    toHierarchy() {
        return d3.hierarchy(this.root);
    }

    addParent(parent: AbstractTreeNode, child: AbstractTreeNode) {
        if (!parent || !child) {
            return;
        }
        parent.children.push(child);
    }

    addTweetsFromContext(tweetContext: TweetContext) {
        let parent = null;
        for (let ancestor of tweetContext.ancestors) {
            var ancestorNode = new TweetNode(ancestor);
            if (!this.root) {
                this.root = ancestorNode;
            }
            this.addParent(parent, ancestorNode);
            parent = ancestor;
        }

        var contextTweetNode = new TweetNode(tweetContext.tweet);
        this.addParent(parent, contextTweetNode);
        if (!this.root) {
            this.root = contextTweetNode;
        }
        parent = contextTweetNode;

        for (let descentantGroup of tweetContext.descentants) {
            parent = contextTweetNode;
            for (let descendant of descentantGroup) {
                var descendantNode = new TweetNode(descendant);
                this.addParent(parent, descendantNode);
                parent = descendantNode;
            }
        }

        if (tweetContext.has_more) {
            this.addParent(contextTweetNode,
                new HasMoreNode(contextTweetNode, tweetContext.continuation));
        }
    }
}
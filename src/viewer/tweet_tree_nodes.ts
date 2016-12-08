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
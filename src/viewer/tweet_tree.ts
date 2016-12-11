class AbstractTreeNode {
    children: Map<String, AbstractTreeNode>;

    constructor() {
        this.children = new Map<String, AbstractTreeNode>();
    }

    getId(): string {
        throw new Error('Not implemented');
    }

    toHierarchy() {
        return d3.hierarchy(this, (d: AbstractTreeNode) => Array.from(d.children.values()));
    }
}

class HasMoreNode extends AbstractTreeNode {
    parent: TweetNode;
    continuation: string;

    getId() {
        return `${this.parent.getId()}_${this.continuation}`;
    }

    constructor(parent: TweetNode, continuation?: string) {
        super();
        this.parent = parent;
        this.continuation = continuation;
    }
}

class TweetNode extends AbstractTreeNode {
    tweet: Tweet;
    hasMoreNodeId: string;

    getId() {
        return this.tweet.id;
    }

    constructor(tweet: Tweet) {
        super();
        this.tweet = tweet;
    }

    private static addParent(parent: AbstractTreeNode, child: AbstractTreeNode): TweetNode {
        if (!parent || !child) {
            return <TweetNode>child;
        }
        if (parent.children.has(child.getId())) {
            return <TweetNode>parent.children.get(child.getId());
        }
        parent.children.set(child.getId(), child);
        return <TweetNode>child;
    }

    static addHasMoreNode(parent: TweetNode, continuation?: string) {
        let hasMoreNode = new HasMoreNode(parent, continuation);
        TweetNode.addParent(parent, hasMoreNode);
        parent.hasMoreNodeId = hasMoreNode.getId();
    }

    addChildrenFromContext(tweetContext: TweetContext) {
        for (let descentantGroup of tweetContext.descentants) {
            let parent: TweetNode = this;
            for (let descendant of descentantGroup) {
                var descendantNode = new TweetNode(descendant);
                TweetNode.addParent(parent, descendantNode);
                parent = descendantNode;
            }
        }

        this.children.delete(this.hasMoreNodeId);
        if (tweetContext.continuation) {
            TweetNode.addHasMoreNode(this, tweetContext.continuation);
        }
    }

    static createFromContext(tweetContext: TweetContext): TweetNode {
        let root = null;
        let parent = null;
        for (let ancestor of tweetContext.ancestors) {
            var ancestorNode = new TweetNode(ancestor);
            if (!root) {
                root = ancestorNode;
            }
            ancestorNode = this.addParent(parent, ancestorNode);
            parent = ancestorNode;
        }

        var contextTweetNode = new TweetNode(tweetContext.tweet);
        contextTweetNode = this.addParent(parent, contextTweetNode);
        contextTweetNode.addChildrenFromContext(tweetContext);

        if (!root) {
            root = contextTweetNode;
        }
        return root;
    }
}
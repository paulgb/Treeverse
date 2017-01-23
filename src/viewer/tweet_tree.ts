/**
 * Base class for all tree nodes.
 */
class AbstractTreeNode {
    /**
     * Children of this node, represented as a map from ids to
     * AbstractTreeNodes.
     */
    children: Map<String, AbstractTreeNode>;

    constructor() {
        this.children = new Map<String, AbstractTreeNode>();
    }

    /** Returns a unique ID for this node. */
    getId(): string {
        throw new Error('Not implemented');
    }

    /** Returns a d3 hierarchy for the tree rooted at this node. */
    toHierarchy() {
        return d3.hierarchy(this, (d: AbstractTreeNode) => Array.from(d.children.values()));
    }
}

/**
 * A tree node representing the existance of more nodes not yet loaded.
 */
class HasMoreNode extends AbstractTreeNode {
    parent: TweetNode;
    continuation: string;

    constructor(parent: TweetNode, continuation: string) {
        super();
        this.parent = parent;
        this.continuation = continuation;
    }

    getId() {
        // Parent continuation string is used so that d3 sees this as a new
        // HasMoreNode when another HasMoreNode has exited on the same parent.
        return `${this.parent.getId()}_${this.continuation}`;
    }
}

/**
 * A tree node representing an individual tweet.
 */
class TweetNode extends AbstractTreeNode {
    tweet: Tweet;
    hasMoreNodeId: string;
    continuation: string;
    fullyLoaded: boolean;

    constructor(tweet: Tweet) {
        super();
        this.tweet = tweet;
    }

    getId() {
        return this.tweet.id;
    }

    /**
     * Return false iff this tweet has more replies that we know about.
     */
    hasMore(): boolean {
        // The fully loaded flag takes precedence because sometimes the
        // reply count from twitter is greater than the number of tweets
        // we actually get back from the API. This is probably because of
        // replies from private accounts.
        if (this.fullyLoaded) return false;
        if (this.continuation) return true;
        return this.children.size < this.tweet.replies;
    }

    /** Creates a tree from the given TweetContext and returns the root,
     *  which is the first ancestor in the context. */
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
        this.continuation = tweetContext.continuation;
        if (tweetContext.continuation) {
            this.addHasMoreNode(tweetContext.continuation);
        } else {
            this.fullyLoaded = true;
        }
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

    private addHasMoreNode(continuation: string) {
        let hasMoreNode = new HasMoreNode(this, continuation);
        TweetNode.addParent(this, hasMoreNode);
        this.hasMoreNodeId = hasMoreNode.getId();
    }
}
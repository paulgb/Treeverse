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
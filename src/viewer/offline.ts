class Offline {
    resourceGetter: ResourceGetter;

    constructor(resourceGetter: ResourceGetter) {
        this.resourceGetter = resourceGetter;
    }

    async inlineResources(doc: Document): Promise<Document> {
        for (let scriptElement of doc.getElementsByTagName('script')) {
            let url = scriptElement.getAttribute('src');
            let content = await this.resourceGetter.getResource(url);
            scriptElement.removeAttribute('src');
            scriptElement.innerHTML = content;
        }
        let linkElements = Array.from(doc.getElementsByTagName('link'));
        for (let linkElement of linkElements) {
            let url = linkElement.getAttribute('href');
            let content = await this.resourceGetter.getResource(url);
            let styleElement = document.createElement('style');
            styleElement.setAttribute('type', linkElement.getAttribute('type'));
            styleElement.innerHTML = content;
            linkElement.parentNode.appendChild(styleElement);
            linkElement.remove();
        }
        return doc;
    }

    async createOfflineHTML(tree: TweetNode): Promise<string> {
        let treeJson = JSON.stringify(SerializedTweetNode.fromTweetNode(tree));

        let htmlBody: string = await this.resourceGetter.getResource("view.html");

        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlBody, 'text/html');

        doc = await this.inlineResources(doc);

        let offlineScript = doc.getElementById('initialization');
        offlineScript.innerText =
            `Treeverse.initializeForStaticData(document.getElementById('tweetContainer'), ${treeJson});`;

        return doc.documentElement.innerHTML;
    }
}

class SerializedTweetNode {
    tweet: Tweet;
    children: SerializedTweetNode[] = [];

    static fromTweetNode(tn: TweetNode) {
        let stn = new SerializedTweetNode();
        stn.tweet = tn.tweet;
        tn.children.forEach((v: AbstractTreeNode) => {
            if (v instanceof TweetNode) {
                stn.children.push(SerializedTweetNode.fromTweetNode(v));
            }
        });
        return stn;
    }

    static toTweetNode(obj) {
        let tweet = new Tweet();
        Object.assign(tweet, obj.tweet);
        let tn = new TweetNode(tweet);
        (<SerializedTweetNode[]>obj.children).forEach((child) => {
            tn.children.set(child.tweet.id, SerializedTweetNode.toTweetNode(child));
        });
        tn.fullyLoaded = true;
        return tn;
    }
}
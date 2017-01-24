/**
 * Functions for dealing with twarc (https://github.com/DocNow/twarc) archives.
 */
var Archive;
(function (Archive) {
    /**
     * Escape HTML special characters in the given string.
     */
    function escapeHTML(html) {
        let elem = document.createElement('div');
        elem.appendChild(document.createTextNode(html));
        return elem.innerHTML;
    }
    /**
     * Parse an object in the format of a Twitter API response into a
     * (Tweet, parent id) pair.
     */
    function parseTweet(tweetObject) {
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
    function parseTweetsFromArchive(archive) {
        let nodes = new Map();
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
    Archive.parseTweetsFromArchive = parseTweetsFromArchive;
})(Archive || (Archive = {}));

/**
 * Controller for the "feed" display that shows the conversation
 * leading up to the selected tweet.
 */
class FeedController {
    constructor(container) {
        this.container = container;
    }
    setFeed(node) {
        let ancestors = node.ancestors();
        ancestors.reverse();
        let comments = d3
            .select(this.container.getElementsByClassName('comments')[0])
            .selectAll('div.comment')
            .data(ancestors, (d) => d.data.getId());
        comments.exit().style('opacity', 1)
            .transition().duration(100)
            .style('opacity', 0).remove();
        comments
            .enter()
            .append('div')
            .classed('comment', true)
            .each(function (datum) {
            if (datum.data instanceof TweetNode) {
                let tweet = datum.data.tweet;
                let div = d3.select(this);
                div
                    .append('a')
                    .classed('avatar', true)
                    .append('img')
                    .attr('src', tweet.avatar)
                    .style('height', 'auto')
                    .style('max-width', 35)
                    .style('width', 'auto')
                    .style('max-height', 35);
                let content = div
                    .append('div')
                    .classed('content', true);
                content
                    .append('span')
                    .classed('author', true)
                    .html(`${tweet.name} (<a href="${tweet.getUserUrl()}">@${tweet.username}</a>)`);
                let body = content
                    .append('div')
                    .classed('text', true)
                    .html(tweet.bodyHtml);
                body.append('a')
                    .html(' &rarr;')
                    .attr('href', tweet.getUrl());
                if (tweet.images) {
                    let imgWidth = 100 / tweet.images.length;
                    content.append('div')
                        .classed('extra images', true)
                        .selectAll('img')
                        .data(tweet.images)
                        .enter()
                        .append('img')
                        .attr('width', (d) => `${imgWidth}%`)
                        .attr('src', (d) => d);
                }
            }
        })
            .style('opacity', 0)
            .style('display', 'none')
            .transition()
            .delay(150)
            .style('display', 'block')
            .style('opacity', 1);
        d3.transition(null).delay(150).tween("scroll", () => {
            let interp = d3.interpolateNumber(this.container.scrollTop, this.container.scrollHeight);
            return (t) => this.container.scrollTop = interp(t);
        });
    }
}

/**
 * Controller for the box with information about Treeverse, as well
 * as some mode-dependent controls such as a download link and
 * upload dropbox.
 */
class InfoBox {
    constructor(container) {
        this.container = container;
    }
    addDownloadButton(callback) {
        d3.select(this.container)
            .append('a')
            .text('Download an offline version of this view')
            .on('click', callback);
    }
    addUploadBox(callback) {
        let dropZone = d3.select(this.container)
            .append('div')
            .classed('dropzone', true)
            .text('Drop twarc .json output file here.')
            .on('dragover', () => d3.event.preventDefault())
            .on('drop', () => {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            let file = d3.event.dataTransfer.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                let result = e.target['result'];
                let lines = result.split(/\r?\n/);
                lines.pop();
                let archiveData = lines.map(JSON.parse);
                console.log(archiveData);
                let newRoot = Archive.parseTweetsFromArchive(archiveData);
                if (newRoot) {
                    callback(newRoot);
                }
            };
            reader.readAsText(file);
        });
    }
}

/**
 * Contains entry points for bootstrapping the visualization for
 * different modes.
 */
var Treeverse;
(function (Treeverse) {
    function initializeForExtension(container, location) {
        let [_, username, tweetId] = location.hash.match(/#(.+),(.+)/);
        let controller = new VisualizationController(document.getElementById('container'));
        controller.setResourceGetter(new ExtensionResourceGetter());
        let rootTweet = new Tweet();
        rootTweet.username = username;
        rootTweet.id = tweetId;
        controller.fetchTweets(rootTweet);
    }
    Treeverse.initializeForExtension = initializeForExtension;
    function initializeForStaticData(container, staticData) {
        let controller = new VisualizationController(document.getElementById('container'), true);
        let root = SerializedTweetNode.toTweetNode(staticData);
        controller.setInitialTweetData(root);
    }
    Treeverse.initializeForStaticData = initializeForStaticData;
    function initializeForArchiveReader(container) {
        let controller = new VisualizationController(document.getElementById('container'), true);
        controller.enableArchiveUpload();
    }
    Treeverse.initializeForArchiveReader = initializeForArchiveReader;
})(Treeverse || (Treeverse = {}));

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class Offline {
    constructor(resourceGetter) {
        this.resourceGetter = resourceGetter;
    }
    inlineResources(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let scriptElement of doc.getElementsByTagName('script')) {
                let url = scriptElement.getAttribute('src');
                let content = yield this.resourceGetter.getResource(url);
                scriptElement.removeAttribute('src');
                scriptElement.innerHTML = content;
            }
            let linkElements = Array.from(doc.getElementsByTagName('link'));
            for (let linkElement of linkElements) {
                let url = linkElement.getAttribute('href');
                let content = yield this.resourceGetter.getResource(url);
                let styleElement = document.createElement('style');
                styleElement.setAttribute('type', linkElement.getAttribute('type'));
                styleElement.innerHTML = content;
                linkElement.parentNode.appendChild(styleElement);
                linkElement.remove();
            }
            return doc;
        });
    }
    createOfflineHTML(tree) {
        return __awaiter(this, void 0, void 0, function* () {
            let treeJson = JSON.stringify(SerializedTweetNode.fromTweetNode(tree));
            let htmlBody = yield this.resourceGetter.getResource("index.html");
            let parser = new DOMParser();
            let doc = parser.parseFromString(htmlBody, 'text/html');
            doc = yield this.inlineResources(doc);
            let offlineScript = doc.getElementById('initialization');
            offlineScript.innerText =
                `Treeverse.initializeForStaticData(document.getElementById('tweetContainer'), ${treeJson});`;
            return doc.documentElement.innerHTML;
        });
    }
}
class SerializedTweetNode {
    constructor() {
        this.children = [];
    }
    static fromTweetNode(tn) {
        let stn = new SerializedTweetNode();
        stn.tweet = tn.tweet;
        tn.children.forEach((v) => {
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
        obj.children.forEach((child) => {
            tn.children.set(child.tweet.id, SerializedTweetNode.toTweetNode(child));
        });
        tn.fullyLoaded = true;
        return tn;
    }
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * Resource getter for when the code is used within a Chrome extension.
 */
class ExtensionResourceGetter {
    getResource(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                let url = chrome.extension.getURL(`resources/${filename}`);
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        resolve(xhr.responseText);
                    }
                };
                xhr.send();
            });
        });
    }
}
/**
 * Resource getter for when the code is loaded over HTTP. (TODO: incomplete)
 */
class HTTPResourceGetter {
    getResource(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                resolve('not yet implemented');
            });
        });
    }
}

/**
 * Contains information about an individual tweet.
 */
class Tweet {
    constructor() {
        this.images = [];
    }
    /**
     * Returns a URL to this tweet on Twitter.
     */
    getUrl() {
        return `https://twitter.com/${this.username}/status/${this.id}`;
    }
    /**
     * Returns a URL to the profile that posted this tweet on Twitter.
     */
    getUserUrl() {
        return `https://twitter.com/${this.username}`;
    }
}
/**
 * Represents the context of a conversation around a particular tweet. this
 * consists of the tweet itself, (some of) the tweets before it in its
 * reply-chain, and (some of) the reply chains that come after it.
 */
class TweetContext {
    constructor() {
        /** Tweets before this.tweet in the reply-chain. */
        this.ancestors = [];
        /** Chains of replies in response to this.tweet. */
        this.descentants = [];
    }
}
/**
 * Functions for parsing a response from the twitter API into Tweet and
 * TweetContext objects.
 */
var TweetParser;
(function (TweetParser) {
    /**
     * Given an API response with a conversation continuation, parse and return
     * the TweetContext.
     */
    function parseTweetsFromConversationHTML(response) {
        let obj = JSON.parse(response);
        let doc = extractDocFromConversationResponse(response);
        let context = new TweetContext();
        context.descentants = parseDescendants(doc.getElementsByTagName('body')[0]);
        context.continuation = obj.descendants.min_position;
        return context;
    }
    TweetParser.parseTweetsFromConversationHTML = parseTweetsFromConversationHTML;
    /**
     * Given an API response about a particular tweet, parse and return the
     * TweetContext.
     */
    function parseTweetsFromHtml(response) {
        let doc = extractDocFromResponse(response);
        let tweetContext = new TweetContext();
        tweetContext.continuation = doc
            .querySelector('.replies-to .stream-container')
            .getAttribute('data-min-position');
        let ancestorContainer = doc
            .getElementsByClassName('in-reply-to')[0];
        let mainTweetContainer = doc
            .getElementsByClassName('permalink-tweet-container')[0];
        let descendentsContainer = doc
            .getElementsByClassName('replies-to')[0];
        if (ancestorContainer) {
            tweetContext.ancestors = parseTweetsFromStream(ancestorContainer);
        }
        if (mainTweetContainer) {
            tweetContext.tweet = parseTweetsFromStream(mainTweetContainer)[0];
        }
        tweetContext.descentants = parseDescendants(descendentsContainer);
        return tweetContext;
    }
    TweetParser.parseTweetsFromHtml = parseTweetsFromHtml;
    function parseDescendants(container) {
        let descendants = container
            .querySelectorAll('li.ThreadedConversation,div.ThreadedConversation--loneTweet');
        let result = [];
        for (let i = 0; i < descendants.length; i++) {
            let child = descendants[i];
            result.push(parseTweetsFromStream(child));
        }
        return result;
    }
    function extractDocFromResponse(response) {
        let obj = JSON.parse(response);
        let responseHtml = obj.page;
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');
        return doc;
    }
    function extractDocFromConversationResponse(response) {
        let obj = JSON.parse(response);
        let responseHtml = obj.descendants.items_html;
        let parser = new DOMParser();
        let doc = parser.parseFromString(responseHtml, 'text/html');
        return doc;
    }
    function parseTweetsFromStream(streamContainer) {
        let tweetStream = [];
        let tweetElements = streamContainer.getElementsByClassName('tweet');
        let nextChildren = [];
        for (let i = 0; i < tweetElements.length; i++) {
            let tweetElement = tweetElements[i];
            let tweet = new Tweet();
            tweet.username = tweetElement.getAttribute('data-screen-name');
            tweet.name = tweetElement
                .getElementsByClassName('fullname')[0].innerHTML;
            tweet.bodyText = tweetElement
                .getElementsByClassName('tweet-text')[0].textContent;
            tweet.bodyHtml = tweetElement
                .getElementsByClassName('tweet-text')[0].innerHTML;
            tweet.id = tweetElement.getAttribute('data-tweet-id');
            tweet.avatar = tweetElement
                .getElementsByClassName('avatar')[0].getAttribute('src');
            tweet.time = Number(tweetElement
                .getElementsByClassName('_timestamp')[0]
                .getAttribute('data-time-ms'));
            tweet.replies = Number(tweetElement
                .getElementsByClassName('js-actionReply')[0]
                .getElementsByClassName('ProfileTweet-actionCountForPresentation')[0]
                .textContent);
            for (let img of tweetElement.querySelectorAll('.AdaptiveMedia-photoContainer img')) {
                tweet.images.push(img.getAttribute('src'));
            }
            tweetStream.push(tweet);
            nextChildren = [tweet.id];
        }
        return tweetStream;
    }
})(TweetParser || (TweetParser = {}));

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * Interfaces with Twitter API server.
 */
var TweetServer;
(function (TweetServer) {
    /**
     * Requests the TweetContext for a given tweet and returns a promise.
     */
    function requestTweets(tweet) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = getUrlForTweet(tweet);
            let response = yield asyncGet(url);
            return TweetParser.parseTweetsFromHtml(response);
        });
    }
    TweetServer.requestTweets = requestTweets;
    /**
     * Requests the continued conversation for a given tweet and continuation
     * token, and returns a promise.
     */
    function requestContinuation(tweet, continuation) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = getUrlForConversation(tweet, continuation);
            let response = yield asyncGet(url);
            return TweetParser.parseTweetsFromConversationHTML(response);
        });
    }
    TweetServer.requestContinuation = requestContinuation;
    function asyncGet(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    let response = xhr.response;
                    resolve(response);
                };
                xhr.open('GET', url, true);
                xhr.setRequestHeader('x-overlay-request', 'true');
                xhr.send();
            });
        });
    }
    function getUrlForTweet(tweet) {
        return `https://twitter.com/${tweet.username}/status/${tweet.id}`;
    }
    function getUrlForConversation(tweet, continuation) {
        return `https://twitter.com/i/${tweet.username}/conversation/${tweet.id}?max_position=${continuation}`;
    }
})(TweetServer || (TweetServer = {}));

/**
 * Base class for all tree nodes.
 */
class AbstractTreeNode {
    constructor() {
        this.children = new Map();
    }
    /** Returns a unique ID for this node. */
    getId() {
        throw new Error('Not implemented');
    }
    /** Returns a d3 hierarchy for the tree rooted at this node. */
    toHierarchy() {
        return d3.hierarchy(this, (d) => Array.from(d.children.values()));
    }
}
/**
 * A tree node representing the existance of more nodes not yet loaded.
 */
class HasMoreNode extends AbstractTreeNode {
    constructor(parent, continuation) {
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
    constructor(tweet) {
        super();
        this.tweet = tweet;
    }
    getId() {
        return this.tweet.id;
    }
    /**
     * Return false iff this tweet has more replies that we know about.
     */
    hasMore() {
        // The fully loaded flag takes precedence because sometimes the
        // reply count from twitter is greater than the number of tweets
        // we actually get back from the API. This is probably because of
        // replies from private accounts.
        if (this.fullyLoaded)
            return false;
        if (this.continuation)
            return true;
        return this.children.size < this.tweet.replies;
    }
    /** Creates a tree from the given TweetContext and returns the root,
     *  which is the first ancestor in the context. */
    static createFromContext(tweetContext) {
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
    addChildrenFromContext(tweetContext) {
        for (let descentantGroup of tweetContext.descentants) {
            let parent = this;
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
        }
        else {
            this.fullyLoaded = true;
        }
    }
    static addParent(parent, child) {
        if (!parent || !child) {
            return child;
        }
        if (parent.children.has(child.getId())) {
            return parent.children.get(child.getId());
        }
        parent.children.set(child.getId(), child);
        return child;
    }
    addHasMoreNode(continuation) {
        let hasMoreNode = new HasMoreNode(this, continuation);
        TweetNode.addParent(this, hasMoreNode);
        this.hasMoreNodeId = hasMoreNode.getId();
    }
}

/**
 * Renders the main tree visualization.
 */
class TweetVisualization {
    constructor(svgElement, feed) {
        this.buildTree(svgElement);
        this.listeners = d3.dispatch('hover', 'click', 'dblclick');
        let timeIntervals = [
            300,
            600,
            3600,
            10800
        ];
        let timeColors = [
            '#FA5050',
            '#E9FA50',
            '#F5F1D3',
            '#47D8F5'
        ];
        this.colorScale = d3.scaleSqrt()
            .domain(timeIntervals)
            .range(timeColors);
    }
    on(eventType, callback) {
        this.listeners.on(eventType, callback);
    }
    ;
    colorEdge(edgeTarget) {
        let data = edgeTarget.data;
        if (data instanceof TweetNode) {
            let timeDelta = (data.tweet.time - edgeTarget.parent.data.tweet.time) / 1000;
            return this.colorScale(timeDelta).toString();
        }
        else {
            return '#fff';
        }
    }
    static treeWidth(hierarchy) {
        let widths = new Map();
        hierarchy.each((node) => {
            widths.set(node.depth, (widths.get(node.depth) || 0) + 1);
        });
        return Math.max.apply(null, Array.from(widths.values()));
    }
    buildTree(container) {
        this.container = d3.select(container);
        this.treeGroup = this.container.append('g');
        this.edges = this.treeGroup.append('g');
        this.nodes = this.treeGroup.append('g');
        this.container.on('click', () => { this.selected = null; this.redraw(); });
        // Set up zoom functionality.
        this.zoom = d3.zoom()
            .scaleExtent([0, 2])
            .on("zoom", () => {
            let x = d3.event.transform.x;
            let y = d3.event.transform.y;
            let scale = d3.event.transform.k;
            this.treeGroup.attr('transform', `translate(${x} ${y}) scale(${scale})`);
        });
        this.container.call(this.zoom);
    }
    zoomToFit() {
        let clientRect = this.container.node().getBoundingClientRect();
        let zoomLevel = Math.min(clientRect.height / this.yscale, clientRect.width / this.xscale, 1);
        this.container.transition().call(this.zoom.transform, d3.zoomIdentity.translate(Math.max(0, (clientRect.width - this.xscale * zoomLevel) / 2), Math.max(20, (clientRect.height - this.yscale * zoomLevel) / 2)).scale(zoomLevel));
    }
    setTreeData(tree) {
        let hierarchy = tree.toHierarchy();
        let layout = d3.tree().separation((a, b) => a.children || b.children ? 3 : 2)(hierarchy);
        this.layout = layout;
        let maxWidth = TweetVisualization.treeWidth(hierarchy);
        this.xscale = maxWidth * 120;
        this.yscale = hierarchy.height * 120;
        this.redraw();
    }
    redraw() {
        if (!this.layout) {
            return;
        }
        let edgeToPath = (d) => {
            let startX = this.xscale * d.parent.x;
            let startY = this.yscale * d.parent.y;
            let endY = this.yscale * d.y;
            let endX = this.xscale * d.x;
            return `M${startX},${startY} C${startX},${startY} ${endX},${startY} ${endX},${endY}`;
        };
        let duration = 200;
        let paths = this.edges
            .selectAll('path')
            .data(this.layout.descendants().slice(1), (d) => d.data.getId());
        paths.exit().remove();
        paths.attr('opacity', 1).transition().duration(duration).attr('d', edgeToPath);
        paths
            .enter()
            .append("path")
            .attr('d', edgeToPath)
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('stroke', this.colorEdge.bind(this))
            .attr('opacity', 0)
            .transition().delay(duration)
            .attr('opacity', 1);
        let nodes = this.nodes.selectAll('g')
            .data(this.layout.descendants(), (d) => d.data.getId());
        nodes.exit().remove();
        nodes.transition()
            .duration(duration)
            .attr('transform', d => `translate(${(this.xscale * d.x) - 20} ${(this.yscale * d.y) - 20})`);
        nodes.classed('has_more', (d) => d.data instanceof TweetNode && d.data.hasMore())
            .classed('selected', (d) => d.data.tweet == this.selected)
            .attr('opacity', 1);
        nodes.enter()
            .append('g')
            .style('cursor', 'pointer')
            .on('mouseover', (e) => {
            if (!this.selected) {
                this.listeners.call('hover', null, e);
            }
        })
            .on('click', (e) => {
            if (e.data instanceof TweetNode) {
                this.listeners.call('hover', null, e);
                this.selected = e.data.tweet;
                this.redraw();
            }
            d3.event.stopPropagation();
        })
            .on('dblclick', (e) => {
            this.listeners.call('dblclick', null, e.data);
            d3.event.stopPropagation();
            this.selected = null;
        })
            .classed('has_more', (d) => d.data instanceof TweetNode && d.data.hasMore())
            .attr('transform', d => `translate(${(this.xscale * d.x) - 20} ${(this.yscale * d.y) - 20})`)
            .each(function (datum) {
            let group = d3.select(this);
            if (datum.data instanceof TweetNode) {
                let tweet = datum.data.tweet;
                group.append('image')
                    .attr('xlink:href', tweet.avatar)
                    .attr('height', 40)
                    .attr('width', 40);
                group.append('rect')
                    .attr('x', -1)
                    .attr('y', -1)
                    .attr('height', 42)
                    .attr('width', 42)
                    .attr('stroke', '#ddd')
                    .attr('stroke-width', '3px')
                    .attr('rx', "4px")
                    .attr('fill', 'none');
                group.append('use')
                    .classed('has_more_icon', true)
                    .attr('xlink:href', '#has_more')
                    .attr('transform', 'scale(0.5) translate(55 55)');
            }
            else if (datum.data instanceof HasMoreNode) {
                group.append('use')
                    .attr('xlink:href', '#has_more');
                group.append('rect')
                    .attr('width', 40)
                    .attr('height', 40)
                    .attr('opacity', 0);
            }
        })
            .attr('opacity', 0)
            .transition().delay(duration)
            .attr('opacity', 1);
    }
}

/**
 * The controller for the main tree visualization.
 */
class VisualizationController {
    constructor(container, offline = false) {
        // TODO: container isn't used.
        this.feed = new FeedController(document.getElementById('feedContainer'));
        this.vis = new TweetVisualization(document.getElementById('tree'), this.feed);
        this.infoBox = new InfoBox(document.getElementById('infoBox'));
        this.vis.on('hover', this.feed.setFeed.bind(this.feed));
        if (!offline) {
            this.vis.on('dblclick', this.expandNode.bind(this));
        }
    }
    fetchTweets(tweet) {
        TweetServer.requestTweets(tweet).then((context) => {
            document.getElementsByTagName('title')[0].innerText =
                `${context.tweet.username} - "${context.tweet.bodyText}" in Treeverse`;
            this.setInitialTweetData(TweetNode.createFromContext(context));
        });
    }
    enableArchiveUpload() {
        this.infoBox.addUploadBox(this.setInitialTweetData.bind(this));
    }
    setInitialTweetData(root) {
        this.tweetTree = root;
        this.vis.setTreeData(root);
        this.vis.zoomToFit();
    }
    setResourceGetter(resourceGetter) {
        this.resourceGetter = resourceGetter;
        this.infoBox.addDownloadButton(this.downloadPage.bind(this));
    }
    downloadPage() {
        var offliner = new Offline(this.resourceGetter);
        offliner.createOfflineHTML(this.tweetTree).then((data) => {
            let blob = new Blob([data], { type: 'text/html' });
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('download', 'treeverse.html');
            downloadLink.setAttribute('href', window.URL.createObjectURL(blob));
            downloadLink.click();
        });
    }
    expandNode(node) {
        if (node instanceof HasMoreNode) {
            this.expandNode(node.parent);
        }
        else if (node instanceof TweetNode) {
            if (node.continuation) {
                TweetServer
                    .requestContinuation(node.tweet, node.continuation)
                    .then((context) => {
                    node.addChildrenFromContext(context);
                    this.vis.setTreeData(this.tweetTree);
                    if (node.tweet.id == this.tweetTree.tweet.id) {
                        // Only adjust zoom if this is loading more replies to
                        // the root tweet.
                        this.vis.zoomToFit();
                    }
                });
            }
            else {
                TweetServer
                    .requestTweets(node.tweet)
                    .then((context) => {
                    node.addChildrenFromContext(context);
                    this.vis.setTreeData(this.tweetTree);
                });
            }
        }
    }
}

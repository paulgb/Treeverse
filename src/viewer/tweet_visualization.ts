type D3Selector = d3.Selection<HTMLElement, {}, null, undefined>;

class TweetVisualization {
    private container: D3Selector;
    private treeGroup: D3Selector;
    private nodes: D3Selector;
    private edges: D3Selector;
    private feed: FeedController;
    private zoom: d3.ZoomBehavior<Element, {}>;
    private listeners: d3.Dispatch<EventTarget>;
    private colorScale: d3.ScalePower<string, number>;
    private frozen: boolean;

    constructor(svgElement: HTMLElement, feed: FeedController) {
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

        this.colorScale = d3.scaleSqrt<string, number>()
            .domain(timeIntervals)
            .range(timeColors);
    }

    on(eventType, callback) {
        this.listeners.on(eventType, callback);
    };

    private colorEdge(edgeTarget: d3.HierarchyNode<AbstractTreeNode>) {
        let data = edgeTarget.data;
        if (data instanceof TweetNode) {
            let timeDelta = (data.tweet.time - (<TweetNode>edgeTarget.parent.data).tweet.time) / 1000;
            return this.colorScale(timeDelta).toString();
        } else {
            return '#fff';
        }
    }

    private static treeWidth<T>(hierarchy: d3.HierarchyNode<T>) {
        let widths = new Map<number, number>();
        hierarchy.each((node) => {
            widths.set(node.depth, (widths.get(node.depth) || 0) + 1);
        })

        return Math.max.apply(null, Array.from(widths.values()));
    }

    private buildTree(container: HTMLElement) {
        this.container = d3.select(container);
        this.treeGroup = <D3Selector>this.container.append('g');

        this.edges = <D3Selector>this.treeGroup.append('g');
        this.nodes = <D3Selector>this.treeGroup.append('g');

        this.container.on('click', () => { this.frozen = false });

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

    private zoomToFit() {
        let bbox = (<SVGSVGElement><any>this.container.node()).getBBox();
        let clientRect = this.container.node().getBoundingClientRect();
        let zoomLevel = Math.min(clientRect.height / (bbox.height + 40), clientRect.width / (bbox.width + 40));

        this.container.call(this.zoom.transform, d3.zoomIdentity.translate(
            Math.max(0, (clientRect.width - bbox.width) / 2),
            Math.max(20, (clientRect.height - bbox.height) / 2)
        ).scale(zoomLevel));
    }

    setTreeData(tree: TweetNode) {
        console.log(tree);
        let hierarchy = tree.toHierarchy();
        let layout = d3.tree().separation((a, b) => a.children || b.children ? 3 : 2)(hierarchy);

        let maxWidth = TweetVisualization.treeWidth(hierarchy);

        let xscale = maxWidth * 120;
        let yscale = hierarchy.height * 120;

        let edgeToPath = (d: d3.HierarchyPointNode<Tweet>) => {
            let startX = xscale * d.parent.x;
            let startY = yscale * d.parent.y;
            let endY = yscale * d.y;
            if (d.parent.x == d.x) {
                return `M${startX},${startY} ${startX},${endY}`;
            } else {
                let endX = xscale * d.x;
                return `M${startX},${startY} C${startX},${startY} ${endX},${startY} ${endX},${endY}`;
            }
        }

        let duration = 1000;

        let paths = this.edges
            .selectAll('path')
            .data(layout.descendants().slice(1), (d: d3.HierarchyPointNode<AbstractTreeNode>) => d.data.getId());

        paths.exit().remove();
        paths.transition().duration(duration).attr('d', edgeToPath);

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
            .data(layout.descendants(), (d: d3.HierarchyPointNode<AbstractTreeNode>) => d.data.getId());

        nodes.exit().remove();

        nodes.transition()
            .duration(duration)
            .attr('transform', d => `translate(${(xscale * d.x) - 20} ${(yscale * d.y) - 20})`);

        nodes.classed('has_more', (d: d3.HierarchyPointNode<TweetNode>) =>
            d.data instanceof TweetNode && (d.data.tweet.replies > (d.children || []).length));

        nodes.enter()
            .append('g')
            .style('cursor', 'pointer')
            .on('mouseover', (e: PointNode) => {
                if (!this.frozen) {
                    this.listeners.call('hover', null, e)
                }
            })
            .on('click', (e: PointNode) => {
                this.listeners.call('hover', null, e);
                this.frozen = true;
                d3.event.stopPropagation();
            })
            .on('dblclick', (e: PointNode) => {
                this.listeners.call('dblclick', null, e.data);
                d3.event.stopPropagation();
                this.frozen = false;
            })
            .classed('has_more', (d: d3.HierarchyPointNode<TweetNode>) =>
                d.data instanceof TweetNode && (d.data.tweet.replies > (d.children || []).length))
            .attr('transform', d => `translate(${(xscale * d.x) - 20} ${(yscale * d.y) - 20})`)
            .each(function (this: Element, datum: PointNode) {
                let group = d3.select(this);
                if (datum.data instanceof TweetNode) {
                    let tweet = datum.data.tweet;
                    group.append('image')
                        .attr('xlink:href', tweet.avatar)
                        .attr('height', 40)
                        .attr('width', 40)

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

                } else if (datum.data instanceof HasMoreNode) {
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
            .attr('opacity', 1);;

    }
}
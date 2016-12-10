type D3Selector = d3.Selection<HTMLElement, {}, null, undefined>;

class TweetVisualization {
    private container: D3Selector;
    private treeGroup: D3Selector;
    private nodes: D3Selector;
    private edges: D3Selector;
    private feed: FeedController;
    private zoom: d3.ZoomBehavior<Element, {}>;
    private listeners: d3.Dispatch<EventTarget>;

    constructor(svgElement: HTMLElement, feed: FeedController) {
        this.buildTree(svgElement);
        this.listeners = d3.dispatch('hover', 'click', 'dblclick');
    }

    on(eventType, callback) {
        this.listeners.on(eventType, callback);
    };

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
        console.log('here1', tree);
        let hierarchy = tree.toHierarchy();
        let layout = d3.tree()(hierarchy);

        let maxWidth = TweetVisualization.treeWidth(hierarchy);

        let xscale = maxWidth * 120;
        let yscale = hierarchy.height * 120;

        let edgeToPath = (d: d3.HierarchyPointNode<Tweet>) => {
            let startX = xscale * d.parent.x;
            let startY = yscale * d.parent.y;
            let endX = xscale * d.x;
            let endY = yscale * d.y;
            return `M${startX},${startY} C${startX},${startY} ${endX},${startY} ${endX},${endY}`;
        }

        let duration = 1000;

        let paths = this.edges
            .selectAll('path')
            .data(layout.descendants().slice(1), (d: d3.HierarchyPointNode<AbstractTreeNode>) => d.data.getId());

        paths.exit().remove();
        console.log(paths);
        paths.transition().duration(duration).attr('d', edgeToPath);

        paths
            .enter()
            .append("path")
            .attr('d', edgeToPath)
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('stroke', '#888')
            .attr('opacity', 0)
            .transition().delay(duration)
            .attr('opacity', 1);

        let nodes = this.nodes.selectAll('g')
            .data(layout.descendants(), (d: d3.HierarchyPointNode<AbstractTreeNode>) => d.data.getId());

        nodes.exit().remove();

        nodes.transition()
            .duration(duration)
            .attr('transform', d => `translate(${(xscale * d.x) - 20} ${(yscale * d.y) - 20})`);

        nodes.enter()
            .append('g')
            .style('cursor', 'pointer')
            .on('mouseover', (e: PointNode) => this.listeners.call('hover', null, e))
            .on('dblclick', (e: PointNode) => {
                this.listeners.call('dblclick', null, e.data);
                d3.event.stopPropagation();
            })
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
                        .attr('stroke', '#222')
                        .attr('stroke-width', '3px')
                        .attr('rx', "4px")
                        .attr('fill', 'none');

                } else if (datum.data instanceof HasMoreNode) {
                    group.append('circle')
                        .attr('fill', '#800')
                        .attr('cx', 20)
                        .attr('cy', 20)
                        .attr('r', 20);

                    group.append('text')
                        .text('...')
                        .attr('x', 20)
                        .attr('y', 22)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', '32pt')
                        .attr('alignment-baseline', 'baseline')
                        .attr('fill', '#fff');
                }
            })
            .attr('opacity', 0)
            .transition().delay(duration)
            .attr('opacity', 1);;

    }
}
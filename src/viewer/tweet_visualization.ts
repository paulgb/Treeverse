
type D3Selector = d3.Selection<HTMLElement, {}, null, undefined>;

class TweetVisualization {
    container: D3Selector;
    treeGroup: D3Selector;
    nodes: D3Selector;
    edges: D3Selector;
    feed: FeedController;
    zoom: d3.ZoomBehavior<Element, {}>;
    listeners: d3.Dispatch<EventTarget>;

    constructor(svgElement: HTMLElement, feed: FeedController) {
        this.buildTree(svgElement);
        this.listeners = d3.dispatch('hover', 'click', 'doubleclick');
    }

    on(eventType, callback) {
        this.listeners.on(eventType, callback);
    };

    static treeWidth<T>(hierarchy: d3.HierarchyNode<T>) {
        let widths = new Map<number, number>();
        hierarchy.each((node) => {
            widths.set(node.depth, (widths.get(node.depth) || 0) + 1);
        })

        return Math.max.apply(null, Array.from(widths.values()));
    }


    buildTree(container: HTMLElement) {
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

    zoomToFit() {
        let bbox = (<SVGSVGElement><any>this.container.node()).getBBox();
        let clientRect = this.container.node().getBoundingClientRect();
        let zoomLevel = Math.min(clientRect.height / (bbox.height + 40), clientRect.width / (bbox.width + 40));

        this.container.call(this.zoom.transform, d3.zoomIdentity.translate(
            Math.max(0, (clientRect.width - bbox.width) / 2),
            Math.max(20, (clientRect.height - bbox.height) / 2)
        ).scale(zoomLevel));
    }

    setTreeData(tree: TweetTree) {
        let hierarchy = tree.toHierarchy();
        let layout = d3.tree()(hierarchy);

        let maxWidth = TweetVisualization.treeWidth(hierarchy);

        let xscale = maxWidth * 120;
        let yscale = hierarchy.height * 120;

        // todo: transitions
        this.nodes.selectAll().remove();
        this.edges.selectAll().remove();

        let paths = this.edges.selectAll('path').data(layout.descendants().slice(1))
            .enter()
            .append("line")
            .attr("x1", d => xscale * d.parent.x)
            .attr("y1", d => yscale * d.parent.y)
            .attr("x2", d => xscale * d.x)
            .attr("y2", d => yscale * d.y)
            .attr('stroke-width', 2)
            .attr('stroke', '#555');

        let enter = this.nodes.selectAll('g')
            .data(layout.descendants())
            .enter()
            .append('g')
            .on('mouseover', (e: PointNode) => this.listeners.call('hover', null, e))
            .attr('transform', d => `translate(${(xscale * d.x) - 20} ${(yscale * d.y) - 20})`);

        enter.each(function (this: Element, datum: PointNode) {
            let group = d3.select(this);

            if (datum.data instanceof TweetNode) {
                let tweet = datum.data.tweet;
                group.append('image')
                    .attr('xlink:href', tweet.avatar)
                    .attr('height', 40)
                    .attr('width', 40)

                group.append('rect')
                    .attr('height', 40)
                    .attr('width', 40)
                    .attr('stroke', '#222')
                    .attr('stroke-width', '2px')
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

        });


        this.zoomToFit();
    }


}


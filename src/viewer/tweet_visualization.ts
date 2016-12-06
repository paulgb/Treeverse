
type D3Selector = d3.Selection<HTMLElement, {}, null, undefined>;

class TweetVisualization {
    container: D3Selector;
    treeGroup: D3Selector;
    feed: FeedController;
    zoom: d3.ZoomBehavior<Element, {}>;

    static treeWidth<T>(hierarchy: d3.HierarchyNode<T>) {
        let widths = new Map<number, number>();
        hierarchy.each((node) => {
            widths.set(node.depth, (widths.get(node.depth) || 0) + 1);
        })

        return Math.max.apply(null, Array.from(widths.values()));
    }

    constructor(svgElement: HTMLElement, feed: FeedController) {
        this.buildTree(svgElement);
        this.feed = feed;
    }

    buildTree(container: HTMLElement) {
        this.container = d3.select(container);
        this.treeGroup = <D3Selector>this.container.append('g');

        // Set up zoom functionality.
        this.zoom = d3.zoom()
            .scaleExtent([0.5, 2])
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
        //this.container.call(this.zoom.transform, d3.zoomIdentity.translate(20, 20).scale(zoomLevel));
        console.log('k',
            (clientRect.width - bbox.width) / 2,
            (clientRect.height - bbox.height) / 2
        );
        this.container.call(this.zoom.transform, d3.zoomIdentity.translate(
            Math.max(0, (clientRect.width - bbox.width) / 2),
            Math.max(20, (clientRect.height - bbox.height) / 2)
        ).scale(zoomLevel));
    }

    setTreeData(tree: TweetTree) {
        let hierarchy = d3.hierarchy(tree.root);
        let layout = d3.tree()(hierarchy);

        let maxWidth = TweetVisualization.treeWidth(hierarchy);

        let xscale = maxWidth * 120;
        let yscale = hierarchy.height * 120;

        let paths = this.treeGroup.selectAll('path')
            .data(layout.descendants().slice(1))
            .enter()
            .append("line")
            .attr("x1", d => xscale * d.parent.x)
            .attr("y1", d => yscale * d.parent.y)
            .attr("x2", d => xscale * d.x)
            .attr("y2", d => yscale * d.y)
            .attr('stroke-width', 2)
            .attr('stroke', '#555')

        let enter = this.treeGroup.selectAll('g')
            .data(layout.descendants())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${(xscale * d.x) - 20} ${(yscale * d.y) - 20})`)
            .on('mouseover', (e: d3.HierarchyPointNode<Tweet>) => this.feed.setFeed(e));

        enter.append('image')
            .attr('xlink:href', d => (<Tweet>d.data).avatar)
            .attr('height', 40)
            .attr('width', 40)

        enter.append('rect')
            .attr('height', 40)
            .attr('width', 40)
            .attr('stroke', '#222')
            .attr('stroke-width', '2px')
            .attr('rx', "4px")
            .attr('fill', 'none');

        this.zoomToFit();
    }


}


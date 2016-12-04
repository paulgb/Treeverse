
class TweetVisualization {
    constructor(tree: TweetTree) {
        let margin = 10;

        let layout = d3.tree()(d3.hierarchy(tree.root));
        console.log('layout', layout);

        let treeContainer = d3.select('svg#tree');
        let bbox = (<Element>treeContainer.node()).getBoundingClientRect();

        console.log('bbox', bbox);
        let xscale = d3.scaleLinear().domain([0, 1]).range([margin, bbox.width - margin]);
        let yscale = d3.scaleLinear().domain([0, 1]).range([margin, bbox.height - margin]);

        let enter = treeContainer.selectAll('rect')
            .data(layout.descendants())
            .enter();

        console.log('x2', layout.descendants());
        console.log('x3', layout.descendants().slice(1));

        let paths = treeContainer.selectAll('path')
            .data(layout.descendants().slice(1))
            .enter()
            .append("line")
            .attr("x1", d => xscale(d.parent.x))
            .attr("y1", d => yscale(d.parent.y))
            .attr("x2", d => xscale(d.x))
            .attr("y2", d => yscale(d.y))
            .attr('stroke-width', 2)
            .attr('stroke', '#aaa')

        let nodes = enter.append('g')
            .attr('transform', d => `translate(${xscale(d.x) - 20} ${yscale(d.y) - 20})`)
            .on('mouseover', this.selectTweet.bind(this));

        nodes.append('image')
            .attr('xlink:href', d => (<Tweet>d.data).avatar)
            .attr('height', 40)
            .attr('width', 40)

        nodes.append('rect')
            .attr('height', 40)
            .attr('width', 40)
            .attr('stroke', '#ddd')
            .attr('stroke-width', '2px')
            .attr('rx', "4px")
            .attr('fill', 'none')
            .attr('opacity', 1);

        treeContainer.call(d3.zoom().on("zoom", () => {
            nodes.attr('transform', d => `translate(${d3.event.transform.applyX(xscale(d.x)) - 20}
            ${d3.event.transform.applyY(yscale(d.y)) - 20})`);

            paths.attr('x1', d => d3.event.transform.applyX(xscale(d.parent.x)));
            paths.attr('y1', d => d3.event.transform.applyY(yscale(d.parent.y)));
            paths.attr('x2', d => d3.event.transform.applyX(xscale(d.x)));
            paths.attr('y2', d => d3.event.transform.applyY(yscale(d.y)));
        }));
    }

    selectTweet(node: d3.HierarchyNode<Tweet>) {
        let ancestors = node.ancestors();
        ancestors.reverse();

        d3.select('#stream').selectAll('div').remove();

        let comments = d3.select('#stream').selectAll('div')
            .data(ancestors)
            .enter().append('div');

        comments.classed('comment', true);
        comments.append('a').classed('avatar', true).append('img').attr('src', (d) => d.data.avatar)
            .style('height', 'auto')
            .style('max-width', 35)
            .style('width', 'auto')
            .style('max-height', 35);

        let content = comments.append('div').classed('content', true);
        content.append('span').classed('author', true).text((d) => d.data.username);
        //content.append('div').classed('text', true).text((d) => d.data.body);
        content.append('div').classed('text', true).html((d) => d.data.bodyElement.innerHTML);

        /*
        let tweet = node.data;
        console.log(node);

        let ancestors = node.ancestors();
        console.log(ancestors);

        d3.select('#stream').text(tweet.body);
        */
    }
}

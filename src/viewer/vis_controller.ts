
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

        enter.append('rect')
            .attr('height', 10)
            .attr('width', 10)
            .attr('x', d => xscale(d.x))
            .attr('y', d => yscale(d.y))
            .append('title').text(d => (<Tweet>d.data).body);

        let pathEnter = treeContainer.selectAll('path')
            .data(layout.descendants().slice(1))
            .enter()
            .append("line")
            .attr("x1", d => xscale(d.parent.x))
            .attr("y1", d => yscale(d.parent.y))
            .attr("x2", d => xscale(d.x))
            .attr("y2", d => yscale(d.y))
            .attr('stroke-width', 2)
            .attr('stroke', 'black')
        /*
                    .append('path')
                    .attr('d', (d) =>
                        `M ${xscale(d.parent.x)} ${yscale(d.parent.y)} L ${xscale(d.x)} ${yscale(d.y)}`);*/
        /*
        `M${yscale(d.y)},${xscale(d.x)}C${(yscale(d.y + d.parent.y) / 2)},${xscale(d.x)}
        ${(yscale(d.y + d.parent.y) / 2)},${xscale(d.parent.x)}
        ${yscale(d.parent.y)},${xscale(d.parent.x)}`);
            */
        /*
        enter.append('text')
            .text(d => (<Tweet>d.data).body)
            .attr('x', d => d.x * 1000)
            .attr('y', d => d.y * 500);
            */
    }
}

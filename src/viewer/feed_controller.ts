class FeedController {
    container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;

    }

    setFeed(node: d3.HierarchyPointNode<Tweet>) {
        let ancestors = node.ancestors();
        ancestors.reverse();

        d3.select(this.container).selectAll('div').remove();

        let comments = d3.select(this.container).selectAll('div')
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
        content.append('div').classed('text', true).html((d) => d.data.bodyElement.innerHTML);
    }
}
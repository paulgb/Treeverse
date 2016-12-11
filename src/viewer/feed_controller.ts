class FeedController {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    setFeed(node: PointNode) {
        let ancestors = node.ancestors();
        ancestors.reverse();

        let duration = 100;

        let comments = d3
            .select(this.container.getElementsByClassName('comments')[0])
            .selectAll('div.comment')
            .data(ancestors, (d: d3.HierarchyPointNode<AbstractTreeNode>) => d.data.getId());

        comments.exit().style('opacity', 1)
            .transition().duration(duration)
            .style('opacity', 0).remove();

        comments
            .enter()
            .append('div')
            .classed('comment', true)
            .each(function(this: Element, datum: PointNode) {
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
                        .html(tweet.bodyElement.innerHTML);

                    body.append('a')
                        .html(' &rarr;')
                        .attr('href', tweet.getUrl());
                }
            })
            .style('opacity', 0)
            .style('display', 'none')
            //.transition().delay(duration + 100)
            .style('display', 'block')
            .style('opacity', 1);

        this.container.scrollTop = this.container.scrollHeight;

    }
}
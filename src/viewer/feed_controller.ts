class FeedController {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    setFeed(node: PointNode) {
        let ancestors = node.ancestors();
        ancestors.reverse();

        let comments = d3
            .select(this.container.getElementsByClassName('comments')[0])
            .selectAll('div.comment')
            .data(ancestors, (d: d3.HierarchyPointNode<AbstractTreeNode>) => d.data.getId());

        comments.exit().style('opacity', 1)
            .transition().duration(100)
            .style('opacity', 0).remove();

        comments
            .enter()
            .append('div')
            .classed('comment', true)
            .each(function (this: Element, datum: PointNode) {
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
            .style('opacity', 1)

        d3.transition(null).delay(150).tween("scroll",
            () => {
                let interp = d3.interpolateNumber(this.container.scrollTop, this.container.scrollHeight);
                return (t) => this.container.scrollTop = interp(t);
            }
        );

    }
}
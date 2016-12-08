
class FeedController {
    container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;

    }

    setFeed(node: PointNode) {
        let ancestors = node.ancestors();
        ancestors.reverse();

        d3
            .select(this.container)
            .selectAll('div')
            .remove();

        let comments = d3
            .select(this.container)
            .selectAll('div')
            .data(ancestors)
            .enter()
            .append('div')
            .classed('comment', true);

        comments.each(function (this: Element, datum: PointNode) {
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
                    .text(tweet.username);

                content
                    .append('div')
                    .classed('text', true)
                    .html(tweet.bodyElement.innerHTML);
            }
        });
    }
}
import { PointNode } from './visualization_controller';
import * as d3 from 'd3';
import { TweetNode, AbstractTreeNode } from './tweet_tree';

/**
 * Controller for the "feed" display that shows the conversation
 * leading up to the selected tweet.
 */
export class FeedController {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    async exitComments(comments: d3.Selection<any, any, any, any>): Promise<void> {
        return new Promise<void>((resolve) => {
            if (comments.exit().size() == 0) {
                resolve();
                return;
            }
            comments
                .exit()
                .transition().duration(100)
                .on('end', () => resolve())
                .style('opacity', 0)
                .remove()
        });
    }

    async enterComments(comments): Promise<void> {
        return new Promise<void>((resolve) => {
            if (comments.enter().size() == 0) {
                resolve();
                return;
            }
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
                            .style('max-width', '35px')
                            .style('width', 'auto')
                            .style('max-height', '35px');

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
                            .classed('rtl', tweet.rtl)
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
                .transition().duration(100)
                .style('display', 'block')
                .style('opacity', 1)
                .on('start', () => resolve())
        })
    }

    async setFeed(node: PointNode) {
        let ancestors = node.ancestors();
        ancestors.reverse();

        let comments = d3
            .select(this.container.getElementsByClassName('comments')[0])
            .selectAll('div.comment')
            .data(ancestors, (d: d3.HierarchyPointNode<AbstractTreeNode>) => d.data.getId());

        await this.exitComments(comments);
        await this.enterComments(comments);

        d3.transition(null).tween("scroll",
            () => {
                let interp = d3.interpolateNumber(this.container.scrollTop, this.container.scrollHeight);
                return (t) => this.container.scrollTop = interp(t);
            }
        );

    }
}

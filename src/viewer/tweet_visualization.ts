import * as d3 from 'd3'
import { PointNode } from './visualization_controller'
import { TweetNode, TweetTree } from './tweet_tree'

type D3Selector = d3.Selection<Element, {}, null, undefined>;

/**
 * Renders the main tree visualization.
 */
export class TweetVisualization {
    private container: D3Selector;
    private treeGroup: D3Selector;
    private nodes: D3Selector;
    private edges: D3Selector;
    private zoom: d3.ZoomBehavior<Element, {}>;
    private listeners: d3.Dispatch<EventTarget>;
    private colorScale: d3.ScalePower<string, number>;
    private selected: d3.HierarchyPointNode<TweetNode>;
    private xscale: number;
    private yscale: number;
    private layout: d3.HierarchyPointNode<TweetNode>;

    constructor(svgElement: HTMLElement) {
        this.buildTree(svgElement)
        this.listeners = d3.dispatch('hover', 'click', 'dblclick')

        let timeIntervals = [
            300,
            600,
            3600,
            10800
        ]
        let timeColors = [
            '#FA5050',
            '#E9FA50',
            '#F5F1D3',
            '#47D8F5'
        ]

        this.colorScale = d3.scaleSqrt<string, number>()
            .domain(timeIntervals)
            .range(timeColors)
    }

    on(eventType, callback) {
        this.listeners.on(eventType, callback)
    }

    private colorEdge(edgeTarget: d3.HierarchyNode<TweetNode>) {
        let data = edgeTarget.data
        let timeDelta = (data.tweet.time - (<TweetNode>edgeTarget.parent.data).tweet.time) / 1000
        return this.colorScale(timeDelta).toString()
    }

    private static treeWidth<T>(hierarchy: d3.HierarchyNode<T>) {
        let widths = new Map<number, number>()
        hierarchy.each((node) => {
            widths.set(node.depth, (widths.get(node.depth) || 0) + 1)
        })

        return Math.max.apply(null, Array.from(widths.values()))
    }

    private buildTree(container: HTMLElement) {
        this.container = d3.select(container)
        this.treeGroup = <D3Selector>this.container.append('g')

        this.edges = <D3Selector>this.treeGroup.append('g')
        this.nodes = <D3Selector>this.treeGroup.append('g')

        this.container.on('click', () => { this.selected = null; this.redraw() })

        // Set up zoom functionality.
        this.zoom = d3.zoom()
            .scaleExtent([0, 2])
            .on('zoom', () => {
                let x = d3.event.transform.x
                let y = d3.event.transform.y
                let scale = d3.event.transform.k

                this.treeGroup.attr('transform', `translate(${x} ${y}) scale(${scale})`)
            })
        this.container.call(this.zoom)

        d3.select('body').on('keydown', () => {
            if (!this.selected) {
                return
            }
            switch (d3.event.code) {
            case 'ArrowDown':
                if (this.selected.children && this.selected.children.length > 0) {
                    this.selected = this.selected.children[0]
                }
                break
            case 'ArrowUp':
                if (this.selected.parent) {
                    this.selected = this.selected.parent
                }
                break
            case 'ArrowLeft':
                if (this.selected.parent) {
                    let i = this.selected.parent.children.indexOf(this.selected)
                    if (i > 0) {
                        this.selected = this.selected.parent.children[i - 1]
                    }
                }
                break
            case 'ArrowRight':
                if (this.selected.parent) {
                    let i = this.selected.parent.children.indexOf(this.selected)
                    if (i >= 0 && i < this.selected.parent.children.length - 1) {
                        this.selected = this.selected.parent.children[i + 1]
                    }
                }
                break
            case 'Space':
                this.listeners.call('dblclick', null, this.selected.data)
                break
            default:
                return
            }
            this.redraw()
            this.listeners.call('hover', null, this.selected)
        })
    }

    zoomToFit() {
        let clientRect = this.container.node().getBoundingClientRect()
        let zoomLevel = Math.min(clientRect.height / this.yscale, clientRect.width / this.xscale, 1)

        this.container.transition().call(this.zoom.transform, d3.zoomIdentity.translate(
            Math.max(0, (clientRect.width - this.xscale * zoomLevel) / 2),
            Math.max(20, (clientRect.height - this.yscale * zoomLevel) / 2)
        ).scale(zoomLevel))
    }

    setTreeData(tree: TweetTree) {
        let hierarchy = tree.toHierarchy()
        let layout = d3.tree().separation((a, b) => a.children || b.children ? 3 : 2)(hierarchy)
        this.layout = <d3.HierarchyPointNode<TweetNode>>layout

        let maxWidth = TweetVisualization.treeWidth(hierarchy)

        this.xscale = maxWidth * 120
        this.yscale = hierarchy.height * 120

        this.redraw()
    }

    redraw() {
        if (!this.layout) {
            return
        }

        let edgeToPath = (d: d3.HierarchyPointNode<any>) => {
            let startX = this.xscale * d.parent.x
            let startY = this.yscale * d.parent.y
            let endY = this.yscale * d.y
            let endX = this.xscale * d.x
            return `M${startX},${startY} C${startX},${startY} ${endX},${startY} ${endX},${endY}`
        }

        let duration = 200

        let paths = this.edges
            .selectAll('path')
            .data(this.layout.descendants().slice(1), (d: d3.HierarchyPointNode<TweetNode>) => d.data.getId())

        paths.exit().remove()
        paths.attr('opacity', 1).transition().duration(duration).attr('d', edgeToPath)

        paths
            .enter()
            .append('path')
            .attr('d', edgeToPath)
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .attr('stroke', this.colorEdge.bind(this))
            .attr('opacity', 0)
            .transition().delay(duration)
            .attr('opacity', 1)

        let descendents = this.layout.descendants()

        if (this.selected) {
            // If a node is selected, find the node in the new tree with the same ID and select it.
            this.selected = descendents.find((d) => d.data.getId() == this.selected.data.getId())
        }

        let nodes = this.nodes.selectAll('g')
            .data(descendents, (d: d3.HierarchyPointNode<TweetNode>) => d.data.getId())

        nodes.exit().remove()

        nodes.transition()
            .duration(duration)
            .attr('transform', d => `translate(${(this.xscale * d.x) - 20} ${(this.yscale * d.y) - 20})`)

        nodes.each((datum, i, selection) => {
            let data = datum.data
            if (!data.hasMore()) {
                d3.select(selection[i]).select('.has_more_icon').remove()
            }
        })

        nodes
            .classed('selected', (d: d3.HierarchyPointNode<TweetNode>) => d == this.selected)
            .attr('opacity', 1)

        nodes.enter()
            .append('g')
            .style('cursor', 'pointer')
            .on('mouseover', (e: PointNode) => {
                if (!this.selected) {
                    this.listeners.call('hover', null, e)
                }
            })
            .on('click', (e: PointNode) => {
                this.listeners.call('hover', null, e)
                this.selected = e
                this.redraw()
                d3.event.stopPropagation()
            })
            .on('dblclick', (e: PointNode) => {
                this.listeners.call('dblclick', null, e.data)
                d3.event.stopPropagation()
                this.selected = null
            })
            .classed('has_more', (d: d3.HierarchyPointNode<TweetNode>) => d.data.hasMore())
            .attr('transform', d => `translate(${(this.xscale * d.x) - 20} ${(this.yscale * d.y) - 20})`)
            .each(function (this: Element, datum: PointNode) {
                let group = d3.select(this)
                let tweet = datum.data.tweet

                group.append('rect')
                    .attr('height', 40)
                    .attr('width', 40)
                    .attr('fill', 'white')

                group.append('image')
                    .attr('xlink:href', tweet.avatar)
                    .attr('height', 40)
                    .attr('width', 40)

                group.append('rect')
                    .attr('x', -1)
                    .attr('y', -1)
                    .attr('height', 42)
                    .attr('width', 42)
                    .attr('stroke', '#ddd')
                    .attr('stroke-width', '3px')
                    .attr('rx', '4px')
                    .attr('fill', 'none')

                group.call((selection) => {
                    let data = (selection.datum() as any).data
                    if (data.hasMore()) {
                        selection.append('use')
                            .classed('has_more_icon', true)
                            .attr('xlink:href', '#has_more')
                            .attr('transform', 'scale(0.5) translate(55 55)')
                    }
                })
            })
            .attr('opacity', 0)
            .transition().delay(duration)
            .attr('opacity', 1)
    }
}
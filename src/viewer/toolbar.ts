import * as d3 from 'd3'

export class Toolbar {
    container: HTMLElement;

    constructor(element: HTMLElement) {
        this.container = element
    }

    addButton(label: string, onClicked: () => void) {
        d3.select(this.container)
            .append('button')
            .text(label)
            .classed('ui primary button', true)
            .style('margin-bottom', '10px')
            .on('click', onClicked)
    }
}
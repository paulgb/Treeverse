class InfoBox {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    addDownloadButton(callback: () => void) {
        d3.select(this.container)
            .append('a')
            .text('Download an offline version of this view')
            .on('click', callback);
    }
}
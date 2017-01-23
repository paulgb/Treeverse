/**
 * Controller for the box with information about Treeverse, as well
 * as some mode-dependent controls such as a download link and
 * upload dropbox.
 */
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

    addUploadBox(callback: (any) => void) {
        let dropZone = d3.select(this.container)
            .append('div')
            .classed('dropzone', true)
            .text('Drop twarc .json output file here.')
            .on('dragover', () => d3.event.preventDefault())
            .on('drop', () => {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                let file = d3.event.dataTransfer.files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    let result = e.target['result'];
                    let lines = result.split(/\r?\n/);
                    lines.pop();
                    let archiveData = lines.map(JSON.parse);
                    console.log(archiveData);
                    let newRoot = Archive.parseTweetsFromArchive(archiveData);
                    if (newRoot) {
                        callback(newRoot);
                    }
                }
                reader.readAsText(file);
            });
    }
}
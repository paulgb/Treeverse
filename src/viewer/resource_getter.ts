/**
 * Abstract parent for classes which can load resources from the viewer's
 * home directory. For example, instances could load from HTTP, the file system,
 * or the extension resource API.
 */
interface ResourceGetter {
    getResource(filename: string): Promise<string>;
}

/**
 * Resource getter for when the code is used within a Chrome extension.
 */
class ExtensionResourceGetter implements ResourceGetter {
    async getResource(filename: string) {
        return new Promise<string>((resolve) => {
            let url = chrome.extension.getURL(`resources/${filename}`);
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    resolve(<string>xhr.responseText);
                }
            };
            xhr.send();
        });
    }
}

/**
 * Resource getter for when the code is loaded over HTTP. (TODO: incomplete)
 */
class HTTPResourceGetter implements ResourceGetter {
    async getResource(filename: string) {
        return new Promise<string>((resolve) => {
            resolve('not yet implemented');
        });
    }
}
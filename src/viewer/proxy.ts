enum Action {
    state = 'state',
    result = 'result',
    fetch = 'fetch'
}

enum State {
    ready = 'ready',
    listening = 'listening',
    waiting = 'waiting'
}

interface FetchRequest {
    url: string,
    key: string,
    action: 'fetch'
}

interface FetchResponse {
    result: any,
    key: string,
    action: Action.result
}

interface StateResponse {
    action: Action.state,
    state: State
}

export class ContentProxy {
    callbacks: Map<string, (response: FetchResponse) => void> = new Map()
    state: State = State.waiting

    async delegatedFetch(url): Promise<Response> {
        return new Promise<Response>((resolve: (FetchResponse) => void) => {
            this.callbacks.set(url, resolve)
            const request: FetchRequest = {
                action: Action.fetch,
                key: url,
                url: url
            }
            window.postMessage(request, '*')
        })
    }

    async inject() {
        let scr = document.createElement('script')
        scr.setAttribute('src', chrome.runtime.getURL("resources/script/content.js"))
    
        window.addEventListener("message", (message) => {
            switch (message.data.action) {
                case Action.state:
                    const actionData = message.data as StateResponse
                    this.state = actionData.state

                    if (this.state === 'ready') {
                        chrome.runtime.sendMessage({message: 'ready'});
                    }

                    break;
                case Action.result:
                    const resultData = message.data as FetchResponse
                    const callback = this.callbacks.get(resultData.key)
                    callback(resultData.result)
                    break;
            }
        }, false)
        document.body.appendChild(scr);
    }
}


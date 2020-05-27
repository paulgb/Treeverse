function init() {
    let oldSetRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader
    let treeverseAuth = {}

    window.XMLHttpRequest.prototype.setRequestHeader = function (h, v) {
        if (h === 'x-csrf-token' || h === 'authorization') {
            treeverseAuth[h] = v

            window.postMessage({
                action: 'state',
                state: 'ready',
            }, '*')
        }
        oldSetRequestHeader.apply(this, [h, v])
    }

    window.addEventListener("message", (message) => {
        if (message.data.action === 'fetch') {
            fetch(message.data.url, {
                credentials: 'include',
                headers: treeverseAuth
            }).then((x) => x.json()).then((x) => {
                window.postMessage({
                    action: 'result',
                    key: message.data.key,
                    result: x
                }, '*')
            })
        }
    }, false)

    window.postMessage({
        action: 'state',
        state: 'listening',
    }, '*')
}

init()

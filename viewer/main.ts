chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    console.log('load for:', msg);
    response('ok');

});
console.log('ko');
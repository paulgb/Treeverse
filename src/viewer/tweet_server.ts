import { TweetParser, TweetSet } from './tweet_parser'
import { fetchTweets, AuthType } from '../common/util'

declare var content: any


/**
 * Interfaces with Twitter API server.
 */
export class TweetServer {
    auth: AuthType

    constructor(auth: AuthType) {
        this.auth = auth
    }

    /**
     * Requests the TweetContext for a given tweet and returns a promise. 
     */
    async requestTweets(tweetId: string, cursor: string): Promise<TweetSet> {
        //let url = this.getUrlForTweetId(tweetId, cursor)
        let response = await this.asyncGet(tweetId, cursor)

        return TweetParser.parseResponse(tweetId, response as any)
    }

    async asyncGet(tweetId: string, cursor: string) {
        // This is a bit complicated because FireFox and Chrome have
        // subtly different security restrictions around fetching from
        // extensions.

        // In Chrome (as of 79), cross-orign request blocking prevents
        // us from making the request from within the content script
        // context. (see: https://github.com/paulgb/Treeverse/issues/52)
        // Instead, we proxy the request through the background script,
        // where the cross-origin request is allowed because the host
        // is whitelisted in the manifest.

        // In Firefox, the request from the background script is also
        // allowed, but cookies are not sent. This is true whether
        // the `credentials` field in the `fetch` call is set to
        // `include` or `same-origin`, and even if a cookie header
        // is set in the headers object, it is stripped. However,
        // unlike Chrome, Firefox does not block the request from the
        // content script context, so we can switch on that. To
        // determine whether we are in Firefox or Chrome, we check
        // if the "content" variable is defined, which provides the
        // `fetch` function usable in content scripts.
        // (see: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch)

        if (typeof content === 'undefined') {
            // We are in Chrome; proxy the request through the background context.
            return new Promise<Response>((resolve) => {
                chrome.runtime.sendMessage(
                    { message: "read", tweetId, cursor },
                    resolve);
            })
        } else {
            // We are in Firefox; make the request from the content context.
            return fetchTweets(tweetId, cursor, this.auth)
        }

    }
}
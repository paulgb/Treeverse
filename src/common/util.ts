// This file contains functions that may be used from the background OR the viewer.

export type AuthType = { csrfToken: string, authorization: string }

function getUrlForTweetId(tweetId: string, cursor: string): string {
    let params = new URLSearchParams({
        include_reply_count: '1',
        tweet_mode: 'extended'
    })

    if (cursor !== null && cursor !== undefined) {
        params.set('cursor', cursor)
    }

    return `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?${params.toString()}`
}

export function fetchTweets(tweetId: string, cursor: string, auth: AuthType) {
    let url = getUrlForTweetId(tweetId, cursor)

    let fetch: (input: RequestInfo, init?: RequestInit) =>
        // @ts-ignore missing "content" variable (defined on FireFox)
        Promise<Response> = (typeof content === 'undefined') ? window.fetch : content.fetch // eslint-disable-line no-undef

    return fetch(url, {
        credentials: 'include',
        headers: {
            'x-csrf-token': auth.csrfToken,
            'authorization': auth.authorization
        }
    }).then((x) => x.json()).catch((e) =>
        console.error('Failed to load tweets', e)) // eslint-disable-line no-console
}
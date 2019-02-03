import { APIResponse } from './api'

/**
 * Contains information about an individual tweet.
 */
export class Tweet {
    /** Unique identifier of the tweet. */
    id: string;
    /** Handle of user who posted tweet. */
    username: string;
    /** Screen name of user who posted tweet. */
    name: string;
    /** HTML body of the tweet content. */
    bodyHtml: string;
    bodyText: string;
    /** URL of the avatar image for the user who posted the tweet.  */
    avatar: string;
    /** Time of the tweet in milliseconds since epoch. */
    time: number;
    /** Number of replies (public and private) to the tweet. */
    replies: number;
    /** Whether to render the tweet as right-to-left. */
    rtl: boolean;
    parent: string;

    images: string[] = [];

    /**
     * Returns a URL to this tweet on Twitter.
     */
    getUrl() {
        return `https://twitter.com/${this.username}/status/${this.id}`
    }

    /**
     * Returns a URL to the profile that posted this tweet on Twitter.
     */
    getUserUrl() {
        return `https://twitter.com/${this.username}`
    }
}

export interface TweetSet {
    rootTweet: string
    tweets: Tweet[]
    cursor: string
}

/**
 * Functions for parsing a response from the twitter API into Tweet and
 * TweetContext objects.
 */
export namespace TweetParser {
    export function parseCursor(response: APIResponse): string {
        let cursor = null
        for (let entry of response.timeline.instructions[0].addEntries.entries) {
            if (entry.content.operation && entry.content.operation.cursor) {
                if (entry.content.operation.cursor.cursorType === 'Bottom') {
                    cursor = entry.content.operation.cursor.value
                }
            }
        }
        return cursor
    }

    export function parseTweets(response: APIResponse): Tweet[] {
        let tweets = []
        let users = new Map<string, { handle: string, name: string, avatar: string }>()

        for (let userId in response.globalObjects.users) {
            let user = response.globalObjects.users[userId]
            users.set(userId, {
                handle: user.screen_name,
                name: user.name,
                avatar: user.profile_image_url_https
            })
        }

        for (let tweetId in response.globalObjects.tweets) {
            let entry = response.globalObjects.tweets[tweetId]
            let tweet = new Tweet()
            let user = users.get(entry.user_id_str)

            tweet.id = entry.id_str
            tweet.bodyText = entry.full_text
            tweet.bodyHtml = entry.full_text
            tweet.name = user.name
            tweet.username = user.handle
            tweet.avatar = user.avatar
            tweet.parent = entry.in_reply_to_status_id_str
            tweet.time = new Date(entry.created_at).getTime()
            tweet.replies = entry.reply_count

            console.log(entry, tweet);

            tweets.push(tweet)
        }
        return tweets
    }

    export function parseResponse(rootTweet: string, response: APIResponse): TweetSet {
        const tweets = parseTweets(response)
        const cursor = parseCursor(response)
        return { tweets, cursor, rootTweet }
    }
}
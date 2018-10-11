
export const matchTweetURL = 'https?://twitter.com/(.+)/status/(\\d+)';
export const matchTweetURLRegex = new RegExp(matchTweetURL);

export function getUserAndTweetFromUrl(url: string): [string, string] {
    let match = matchTweetURLRegex.exec(url);
    if (match) {
        return [match[1], match[2]];
    }
}

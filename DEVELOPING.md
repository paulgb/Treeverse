Developing Treeverse
====================

Setup
-----

Treeverse is built with [Gulp](http://gulpjs.com/). The easiest way to set up a
development environment is with [npm](https://www.npmjs.com/). Run `npm install`
in the base directory to install the dependencies.

During the build step, the files in `src/viewer` are transpiled to JavaScript and
bundled into `extension/script/viewer.js`.

After building, the extension in `extension` can be used as an unpacked Chrome
extension (see [Loading an Unpacked Extension](https://developer.chrome.com/extensions/getstarted#unpacked)).

Overview
--------

`src/background/browser_action.ts` is hooked up as the action when the Treeverse
action button is pressed in (the actual wiring is in `manifest.json`). When it is clicked,
it parses the current tweet ID out of the url and opens `view.html` in a new tab. The tweet
id is passed in the URL hash of the new tab. `view.html` includes the `viewer.js` script which
invokes the interactive UI.

`viewer.js` is built from the contents of `src/viewer`, which consists of the following:

- `main.ts` - Parses the tweet out of the URL hash and constructs the `VisualizationController`.
- `visualization_controller.ts` - Orchestrates construction and event handling of the `TweetVisualization` and `FeedController`.
- `tweet_visualization.ts` - Builds the SVG for the visualization.
- `tweet_server.ts` - Interfaces with the Twitter API to load tweets.
    - `tweet_parser.ts` - Used by `TweetServer` to parse API responses.
- `tweet_tree.ts` - Builds a hierarchal data structure out of `TweetServer`'s responses.
- `feed_controller.ts` - Controller for the right-side pane which shows an individual reply-chain. 
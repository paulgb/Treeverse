![NetflixOSS Lifecycle](https://img.shields.io/osslifecycle/paulgb/Treeverse.svg)

Treeverse
=========

Treeverse is a tool for visualizing and navigating Twitter conversation threads.

It is available as a browser extension for Chrome and Firefox.

Installation
------------

### Chrome Users:

<a href="https://chrome.google.com/webstore/detail/treeverse/aahmjdadniahaicebomlagekkcnlcila?hl=en">
    <img src="images/download_chrome.png" alt="Download Treeverse for Chrome" style="width: 206px; height: 58px">
</a>

### Firefox Users:

<a href="https://addons.mozilla.org/en-US/firefox/addon/treeverse/">
    <img src="images/download_moz.png" alt="Download Treeverse for Firefox" style="width: 172px; height: 60px">
</a>

Introduction
------------

After installing Treeverse for your browser, visit Twitter and click on the tweet that you would like to visualize the conversation of.

The icon for Treeverse should turn from grey to blue in your browser. Click it to open a Treeverse
visualization of the tweet you are looking at.

Exploring the Conversation
--------------------------

![Screenshot of Treeverse.](images/treeverse640.gif)

Conversations are visualized as a tree. Each node (square) is an individual tweet, and
an edge (line) between two tweets indicates that the lower one is a reply to the upper
one. The color of the line indicates the time duration between the two tweets
(red is faster, blue is slower.)

As you hover over nodes, the reply-chain preceeding that tweet appears on the right-side
pane. By clicking a node, you can freeze the UI on that tweet in order to interact with
the right-side pane. By clicking anywhere in the tree window, you can un-freeze the tweet
and return to the normal hover behavior.

![Right pane in action.](images/right_pane.png)

Some tweets will appear with a red circle with white ellipses inside them, either overlayed
on them or as a separate node. This means that
there are more replies to that tweet that haven't been loaded. Double-clicking a node will
load additional replies to that tweet.

![More tweets indicator.](images/red_circles.png)

Developing
----------

See [DEVELOPING.md](DEVELOPING.md)

Bugs & Contact
--------------

Tweet [@paulgb](https://twitter.com/paulgb) or report on GitHub.

Credits
-------

Icon created by [Eli Schiff](http://www.elischiff.com/).

Treeverse would not be possible without the excellent [d3.js](https://d3js.org/).
Styling is powered by [Semantic UI](http://semantic-ui.com/). 

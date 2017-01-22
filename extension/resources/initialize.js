if (document.location.hash.match(/#(.+),(.+)/)) {
    Treeverse.initializeForExtension(document.getElementById('tweetContainer'), document.location);
} else {
    Treeverse.initializeForArchiveReader(document.getElementById('tweetContainer'));
}
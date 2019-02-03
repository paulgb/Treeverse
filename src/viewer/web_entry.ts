import { createPage } from './page'
import { VisualizationController } from './visualization_controller'
import { SerializedTweetNode } from './serialize'
import { TweetTree } from './tweet_tree'

export function webInitialize() {
    createPage(document.getElementById('root'))
    let controller = new VisualizationController(null, true)

    let parts = document.location.href.split('/')
    let key = parts[parts.length - 1]

    fetch(`https://s3.amazonaws.com/treeverse/${key}.json`).then((c) => c.json())
        .then((c) => {
            let r = SerializedTweetNode.toTweetNode(c)
            let tree = TweetTree.fromRoot(r)

            controller.setInitialTweetData(tree)
        }).catch((c) => alert(c))
}

webInitialize()

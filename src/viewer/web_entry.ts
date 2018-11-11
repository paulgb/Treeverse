import {createPage} from './page';
import { VisualizationController } from './visualization_controller';
import {SerializedTweetNode} from './serialize';

export function webInitialize() {
    createPage(document.getElementById('root'));
    let controller = new VisualizationController(true);

    let parts = document.location.href.split('/');
    let key = parts[parts.length-1];

    fetch(`https://s3.amazonaws.com/treeverse/${key}.json`).then((c) => c.json())
        .then((c) => {
            let r = SerializedTweetNode.toTweetNode(c);
            controller.setInitialTweetData(r);
        }).catch((c) => alert(c));
}

webInitialize();
export function createPage(container: HTMLElement) {
    let pageHTML = `
        <div id="treeContainer">
            <svg id="tree">
                <defs>
                    <symbol id="has_more">
                        <g transform="translate(20 20)">
                            <circle r="18" fill="#800" stroke-width="2px" stroke="#fff" />
                            <circle r="3" cx="-9" fill="#fff" />
                            <circle r="3" cx="0" fill="#fff" />
                            <circle r="3" cx="9" fill="#fff" />
                        </g>
                    </symbol>
                </defs>
            </svg>
            <div style="position: absolute; bottom: 5px; left: 5px; color: #eee; background-color: rgba(51, 51, 51, 0.8);">
                Colors
                represent reply times:
                <span style="color: #FA5050; margin: 20px;">5&nbsp;minutes</span>
                <span style="color: #E9FA50; margin: 20px;">10&nbsp;minutes</span>
                <span style="color: #F5F1D3; margin: 20px;">1&nbsp;hour</span>
                <span style="color: #47D8F5; margin: 20px;">3&nbsp;hours+</span>
            </div>
        </div>
        <div id="sidebar">
            <div id="infoBox">
                <p>Visualized by
                    <a href="https://treeverse.app">Treeverse</a>.
                    Confused?
                    <a href="https://treeverse.app">Read this</a>. Bugs? Tweet me
                    (<a href="https://twitter.com/paulgb">@paulgb</a>) or
                    <a href="https://github.com/paulgb/Treeverse/issues">report on GitHub</a>.
                </p>
                <p>Tweets with an ellipsis in the bottom right can be expanded by double clicking.</p>
                <p style="background: #ffec49; padding: 4px;"><strong>Note:</strong> Treeverse has been updated for the
                new Twitter UI! Images and links are not yet captured. Please let me know if you find any other bugs.
                <em>(Feb 2, 2019)</em></p>
                <div id="toolbar"></div>
            </div>
            <div id="feedContainer">
                <div id="feedInner">
                    <div class="ui comments" id="feed">
                    </div>
                </div>
            </div>
        </div>
    `

    container.innerHTML = pageHTML
}
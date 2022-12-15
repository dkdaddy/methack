"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const fs_1 = __importDefault(require("fs"));
class Activity {
    constructor(name, startTime, endTime) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
class Action {
    constructor(name, time) {
        this.name = name;
        this.time = time;
    }
}
class Session {
    constructor(user, deviceId, startTime, endTime) {
        this.user = user;
        this.deviceId = deviceId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.eventTimeline = [];
    }
}
class AggregateActiviyOrAction {
    constructor(interation, count, next = []) {
        this.interaction = interation;
        this.count = count;
        this.next = next;
    }
}
const pickRandomActivity = () => {
    const now = new Date();
    if (Math.random() > 0.8)
        return new Activity("BTDY", now, now);
    if (Math.random() > 0.8)
        return new Activity("IB", now, now);
    if (Math.random() > 0.8)
        return new Activity("NSN", now, now);
    if (Math.random() > 0.8)
        return new Activity("HOME", now, now);
    if (Math.random() > 0.8)
        return new Activity("DES", now, now);
    if (Math.random() > 0.8)
        return new Activity("TOP", now, now);
    if (Math.random() > 0.8)
        return new Activity("MSG", now, now);
    return undefined;
};
const randomData = (quantity) => {
    let result = [];
    for (let n = 0; n < quantity; n++) {
        const user = "bob";
        const device = "X-1234";
        const start = new Date();
        const end = new Date();
        const session = new Session(user, device, start, end);
        let lastEvent = undefined;
        for (let t = 0; t < 12; t++) {
            const event = pickRandomActivity();
            if (event && (!lastEvent || event.name != lastEvent.name)) {
                session.eventTimeline.push(event);
                lastEvent = event;
            }
        }
        result.push(session);
    }
    return result;
};
const loadData = () => {
    const data = fs_1.default.readFileSync("final_output.json");
    const sessions = JSON.parse(String(data));
    console.log(`Loaded ${sessions.length} sessions`);
    const mappedSessions = sessions.map((obj) => {
        const session = new Session("bob", "1234", new Date(), new Date());
        obj.activities.forEach((activity) => {
            const mappedActivity = new Activity(activity.name, new Date(), new Date());
            session.eventTimeline.push(mappedActivity);
        });
        return session;
    });
    const temp = mappedSessions; //.slice(0,10000)
    return temp;
};
const reduceSessions = (sessions, from, amount) => {
    let root = new AggregateActiviyOrAction('NSN', 0, []); // not real, name does not matter
    sessions.slice(from, from + amount).forEach(session => {
        let currentNode = root;
        session.eventTimeline.forEach(event => {
            // place this event in this level and move to next level
            let item = currentNode.next.find((node) => node.interaction == event.name);
            if (!item) {
                item = new AggregateActiviyOrAction(event.name, 0, []);
                currentNode.next.push(item);
            }
            item.count++;
            currentNode = item;
        });
    });
    let result = root.next;
    result.sort((a, b) => a.count - b.count); // descending size 
    return result;
};
const renderHTML = (roots) => {
    let html = "";
    const sessions = roots.reduce((prev, curr) => { return prev + curr.count; }, 0);
    const dropOuts = sessions - roots.reduce((prev, curr) => { return prev + curr.next.reduce((p, c) => p + c.count, 0); }, 0);
    html += `Sessions ${sessions} Drop-outs ${dropOuts}<hr><br>`;
    roots.forEach(child => {
        html += renderActivity(child, 1);
    });
    return html;
};
const renderActivity = (activity, level) => {
    let html = "<div>";
    for (let n = 0; n < level; n++) {
        html += "&nbsp;&nbsp;&nbsp;&nbsp;"; // indent
    }
    html += `<span>${activity.interaction}  ${activity.count}</span>`;
    activity.next.forEach(child => {
        html += renderActivity(child, level + 1);
    });
    html += "</div>";
    return html;
};
class SankeyNode {
    constructor() {
        this.name = "";
        this.count = 0;
        this.next = new Map();
    }
}
class Stage {
    constructor() {
        this.nodes = [];
    }
}
class Diagram {
    constructor() {
        this.stages = [];
    }
}
const createDiagram = (roots) => {
    let diagram = new Diagram();
    // find number of stages and set of activities
    let maxDepth = 0;
    let activities = new Set();
    const walk = (node, depth) => {
        maxDepth = Math.max(maxDepth, depth);
        activities.add(node.interaction);
        node.next.forEach(child => {
            walk(child, depth + 1);
        });
    };
    roots.forEach(element => {
        walk(element, 0);
    });
    console.log(`Found ${activities.size} activities in ${maxDepth} stages`);
    for (let stage = 0; stage <= maxDepth; stage++) {
        let stage = new Stage();
        diagram.stages.push(stage);
        activities.forEach(activity => {
            let node = new SankeyNode();
            stage.nodes.push(node);
            node.count = 0;
            node.name = activity;
        });
    }
    const walkAggregate = (activity, depth) => {
        const nodeIx = diagram.stages[depth].nodes.findIndex(node => node.name == activity.interaction);
        const node = diagram.stages[depth].nodes[nodeIx];
        node.count += activity.count;
        activity.next.forEach(childActivity => {
            const previousCount = node.next.get(childActivity.interaction);
            const newCount = (previousCount || 0) + childActivity.count;
            node.next.set(childActivity.interaction, newCount);
            walkAggregate(childActivity, depth + 1);
        });
    };
    roots.forEach(root => {
        walkAggregate(root, 0);
    });
    for (let stage = 0; stage < diagram.stages.length; stage++) {
        diagram.stages[stage].nodes = diagram.stages[stage].nodes.sort((a, b) => b.count - a.count);
    }
    return diagram;
};
const fakeDiagram = () => {
    let diagram = new Diagram();
    const activities = ['IB', 'MSG', 'NSN', 'BDTY', 'TOP'];
    const stages = [1, 2, 3, 4, 5];
    stages.forEach(stageix => {
        const stage = new Stage();
        activities.forEach(activity => {
            const node = new SankeyNode();
            node.name = activity;
            node.count = Math.round(Math.random() * 10000);
            activities.forEach(child => {
                if (child != node.name && Math.random() > .7) {
                    node.next.set(child, Math.round(Math.random() * 1000));
                }
            });
            stage.nodes.push(node);
        });
        stage.nodes = stage.nodes.sort((a, b) => a.count - b.count);
        diagram.stages.push(stage);
    });
    return diagram;
};
const renderTextDiagram = (diagram) => {
    let yorigin = 500;
    const imageWidth = 3800, imageHeight = 2500;
    let html = `<svg width="${imageWidth}" height="${imageHeight}">`;
    let positions = [];
    // before we start rendering we need to compute position of each node to draw the connections
    diagram.stages.forEach((stage, stageIx) => {
        const x = 40 + 260 * stageIx;
        positions.push([]);
        stage.nodes.forEach((node, nodeIx) => {
            const y = 120 * nodeIx + 120;
            positions[stageIx][nodeIx] = { x: x, y: y };
        });
    });
    // positions.forEach(col => {
    //     col.forEach(cell => {
    //         html += `<rect x="${cell.x - 5}" y="${cell.y}" width="5" height="5" fill="blue"></rect>`
    //     })
    // })
    diagram.stages.forEach((stage, stageIx) => {
        const x = 40 + 260 * stageIx;
        // the top level stats
        const sessions = stage.nodes.reduce((p, c) => p += c.count, 0);
        let linkCount = 0;
        stage.nodes.forEach(node => {
            node.next.forEach(link => {
                linkCount += link;
            });
        });
        const dropOuts = sessions - linkCount;
        html += `<text x="${x}" y="${20}" fill="black">${sessions} sessions</text>\n`;
        html += `<text x="${x}" y="${40}" fill="black">${dropOuts} drop-outs</text>\n`;
        stage.nodes.forEach((node, nodeIx) => {
            if (node.count > 0) {
                const y = 120 * nodeIx + 120;
                html += `<text onClick="drill('${node.name}')" x="${x}" y="${y}" fill="black">${node.name}</text>\n`;
                html += `<text x="${x}" y="${y + 20}" fill="black">${node.count}</text>\n`;
                let dy = -9 * node.next.size / 2;
                node.next.forEach((value, key) => {
                    html += `<text x="${x + 40}" y="${y + dy}" fill="red" font-size="x-small">${key}</text>\n`;
                    html += `<text x="${x + 90}" y="${y + dy}" fill="red" font-size="x-small">${value}</text>\n`;
                    // draw connection
                    if (stageIx < diagram.stages.length - 1) {
                        const nextNodeIx = diagram.stages[stageIx + 1].nodes.findIndex(node => node.name == key);
                        const next = positions[stageIx + 1][nextNodeIx];
                        const width = 1 + value / 100;
                        html += `<line x1="${x + 120}" y1="${y + dy}" x2="${(next.x - 5)}" y2="${next.y}" style="stroke:lightgray;stroke-width:${width}" />`;
                    }
                    dy += 9;
                });
            }
        });
    });
    html += '</svg>';
    return html;
};
const renderDiagram = (diagram) => {
    let yorigin = 500;
    const xspace = 300;
    const imageWidth = 3800, imageHeight = 2500;
    let html = `<svg width="${imageWidth}" height="${imageHeight}">`;
    html += `
    <defs>
    <linearGradient id="greenfade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(227, 245, 206);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(129, 182, 80);stop-opacity:1" />
    </linearGradient>
    <linearGradient id="redfade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(226, 59, 30);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgb(241, 152, 146);stop-opacity:0" />
      </linearGradient>
    </defs>
    `;
    let positions = [];
    const firstStageSessionCount = diagram.stages[0].nodes.reduce((p, c) => p + c.count, 0);
    const heightFactor = 400 / firstStageSessionCount; // so total height of boxes is 400 pts
    // before we start rendering we need to compute position of each node to draw the connections
    diagram.stages.forEach((stage, stageIx) => {
        const x = 40 + xspace * stageIx;
        let y = 80; // spacing is based on box size which is proportional to count
        positions.push([]);
        stage.nodes.forEach((node, nodeIx) => {
            const height = node.count * heightFactor;
            positions[stageIx][nodeIx] = { x: x, y: y, height: height, name: node.name, count: node.count };
            y += height + 60;
        });
    });
    positions.forEach(col => {
        col.forEach(cell => {
            if (cell.count) {
                html += `<rect rx="4" ry="4" x="${cell.x}" y="${cell.y}" width="180" height="${cell.height}" fill='url(#greenfade)'></rect>`;
                const y = cell.height < 40 ? cell.y + cell.height + 15 : cell.y + 20;
                html += `<text onClick="drill('${cell.name}')" x="${cell.x + 10}" y="${y}" fill="black">${cell.name}</text>\n`;
                html += `<text x="${cell.x + 10}" y="${y + 17}" fill="black">${cell.count}</text>\n`;
            }
            // console.log('rect', cell)
        });
    });
    diagram.stages.forEach((stage, stageIx) => {
        const x = 40 + xspace * stageIx;
        // the top level stats
        const sessions = stage.nodes.reduce((p, c) => p += c.count, 0);
        let linkCount = 0;
        stage.nodes.forEach(node => {
            node.next.forEach(link => {
                linkCount += link;
            });
        });
        const dropOuts = sessions - linkCount;
        html += `<text x="${x}" y="${20}" fill="black">${sessions} sessions</text>\n`;
        html += `<text x="${x}" y="${40}" fill="black">${dropOuts} drop-outs</text>\n`;
        // stage.nodes.forEach((node, nodeIx) => {
        //     if (node.count > 0) {
        //         const y = 120 * nodeIx + 120
        //         html += `<text onClick="drill('${node.name}')" x="${x}" y="${y}" fill="black">${node.name}</text>\n`
        //         html += `<text x="${x}" y="${y + 20}" fill="black">${node.count}</text>\n`
        //         let dy = -9*node.next.size/2
        //         node.next.forEach((value, key) => {
        //             html += `<text x="${x + 40}" y="${y + dy}" fill="red" font-size="x-small">${key}</text>\n`
        //             html += `<text x="${x + 90}" y="${y + dy}" fill="red" font-size="x-small">${value}</text>\n`
        //             // draw connection
        //             if (stageIx < diagram.stages.length - 1) {
        //                 const nextNodeIx = diagram.stages[stageIx + 1].nodes.findIndex(node => node.name == key)
        //                 const next = positions[stageIx + 1][nextNodeIx]
        //                 const width = 1 + value / 100
        //                 html += `<line x1="${x + 120}" y1="${y + dy}" x2="${(next.x - 5)}" y2="${next.y}" style="stroke:lightgray;stroke-width:${width}" />`
        //             }
        //             dy += 9
        //         })
        //     }
        // })
    });
    html += '</svg>';
    return html;
};
const hostname = ""; //os.hostname();
const port = 8000;
const getMIMEType = (ext) => {
    if (ext == "png")
        return "image/png";
    if (ext == "js")
        return "text/javascript";
    return "text/html";
};
const sessions = loadData();
const server = node_http_1.default.createServer((req, res) => {
    var _a, _b;
    res.statusCode = 200;
    console.log(req.method, req.url);
    if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/analytics")) {
        const html = String(fs_1.default.readFileSync("analytics.html"));
        res.setHeader("Content-Type", "text/html");
        res.end(html);
    }
    else if ((_b = req.url) === null || _b === void 0 ? void 0 : _b.startsWith("/chart/")) {
        const style = req.url.split("/")[2];
        const amountTxt = req.url.split("/")[3];
        const amount = Number.parseInt(amountTxt);
        console.log("chart", style, amount);
        const from = amount == 1 ? Math.round(Math.random() * sessions.length) : 0; //if just one, pick random
        console.log("session slice", from, amount);
        if (style == 'flow') {
            // const sessions = randomData(1000)
            const data = reduceSessions(sessions, from, amount);
            // const html = renderHTML(data)
            // const html = renderDiagram(fakeDiagram())
            const html = renderDiagram(createDiagram(data));
            res.setHeader("Content-Type", "text/html");
            res.end(html);
        }
        else {
            let html = "<div>Raw Data</div><table>";
            // limit to 400 rows
            sessions.slice(from, from + Math.round(Math.min(amount, 400))).forEach((session, ix) => {
                html += `<tr>`;
                html += `<td>${ix}. </td>`;
                session.eventTimeline.forEach(event => {
                    html += `<td>`;
                    html += `${event.name} -->`;
                    html += `</td>`;
                });
                html += `</tr>`;
            });
            html += "</table></div>";
            res.setHeader("Content-Type", "text/html");
            res.end(html);
        }
    }
    else {
        console.log(`unexpected url ${req.url}`);
        res.setHeader("Content-Type", "text/html");
        res.end("error");
    }
});
server.listen(port, hostname, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server running at http://${hostname}:${port}/`);
}));

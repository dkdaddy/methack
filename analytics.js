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
    constructor(interation, count) {
        this.interaction = interation;
        this.count = count;
        this.next = [];
    }
}
const renderHTML = (roots) => {
    let html = "";
    const sessions = roots.reduce((prev, curr) => { return prev + curr.count; }, 0);
    const dropOuts = sessions - roots.reduce((prev, curr) => { return prev + curr.next.reduce((p, c) => p + c.count, 0); }, 0);
    html += `Sessions ${sessions} Drop-outs ${dropOuts}`;
    roots.forEach(child => {
        html += renderActivity(child, 1);
    });
    return html;
};
const renderActivity = (activity, level) => {
    let html = "";
    for (let n = 0; n < level; n++) {
        html += "&nbsp;&nbsp;&nbsp;&nbsp;"; // indent
    }
    html += `<span>${activity.interaction}  ${activity.count}</span>`;
    activity.next.forEach(child => {
        html += renderActivity(child, level + 1);
    });
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
const server = node_http_1.default.createServer((req, res) => {
    var _a;
    res.statusCode = 200;
    console.log(req.method, req.url);
    if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/")) {
        const html = "hello";
        res.end(html);
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

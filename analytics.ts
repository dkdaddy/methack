import http from "node:http"
import fs from "fs"

type ActivityName = 'IB'|'MSG'|'BTDY'
type ActionName = 'MSG.send'|'IB.reply'|'IB.fwd'
type InteractionName = ActivityName|ActionName

class Activity {
    constructor(name:ActivityName, startTime:Date, endTime:Date) {
        this.name = name
        this.startTime = startTime
        this.endTime = endTime
    }
    public name:ActivityName
    public startTime:Date
    public endTime:Date

}
class Action {
    constructor(name:ActionName, time:Date) {
        this.name = name
        this.time = time
    }
    public name:ActionName
    public time:Date
}
type ActivityOrAction = Activity|Action

class Session {
    constructor(user:string, deviceId:string, startTime:Date, endTime:Date) {
        this.user = user
        this.deviceId = deviceId
        this.startTime = startTime
        this.endTime = endTime
        this.eventTimeline = []
    }
    public startTime:Date
    public endTime:Date
    public deviceId:string
    public user:string
    public eventTimeline: ActivityOrAction[] // time ordered
}

class AggregateActiviyOrAction {
    constructor(interation:InteractionName, count:number) {
        this.interaction = interation
        this.count = count
        this.next = []
    }
    public count:number
    public interaction:InteractionName
    public next:AggregateActiviyOrAction[]
}


const renderHTML = (roots:AggregateActiviyOrAction[]):string => {
    let html = ""
    const sessions = roots.reduce((prev, curr) => {return prev+curr.count}, 0)
    const dropOuts = sessions - roots.reduce((prev, curr) => {return prev + curr.next.reduce((p,c)=>p+c.count, 0)},0)
    html += `Sessions ${sessions} Drop-outs ${dropOuts}`
    roots.forEach(child => {
        html += renderActivity(child,1)
    })
    return html
}

const renderActivity = (activity:AggregateActiviyOrAction, level:number):string => {
    let html = ""
    for (let n=0; n<level; n++) {
        html += "&nbsp;&nbsp;&nbsp;&nbsp;" // indent
    }
    html += `<span>${activity.interaction}  ${activity.count}</span>`
    activity.next.forEach(child => {
        html += renderActivity(child,level+1)
    })
    return html
}

const hostname = "" //os.hostname();
const port = 8000

const getMIMEType = (ext: string) => {
    if (ext == "png") return "image/png"
    if (ext == "js") return "text/javascript"
    return "text/html"
}

const server = http.createServer((req, res) => {
    res.statusCode = 200
    console.log(req.method, req.url)
    if (req.url?.startsWith("/")) {
        const html = "hello"
        res.end(html)
    
    } else {
        console.log(`unexpected url ${req.url}`)
        res.setHeader("Content-Type", "text/html")
        res.end("error")
    }
})
server.listen(port, hostname, async () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})

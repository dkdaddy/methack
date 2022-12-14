import http from "node:http"
import fs from "fs"
import { getFips } from "node:crypto"
import { nodeModuleNameResolver } from "typescript"

type ActivityName = 'IB'|'MSG'|'BTDY'|'NSN'
type ActionName = 'MSG.compose'|'IB.reply'|'IB.fwd'
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
const pickRandomActivity = ():Activity|undefined => {
    const now = new Date()
    if (Math.random()>0.8) return new Activity("BTDY", now, now)
    if (Math.random()>0.8) return new Activity("IB", now, now)
    if (Math.random()>0.8) return new Activity("MSG", now, now)
    return undefined
}

const randomData = (quantity:number):Session[] => {
    let result:Session[] = []

    for (let n=0; n<quantity; n++) {
        const user = "bob"
        const device = "X-1234"
        const start = new Date()
        const end = new Date()
        const session = new Session(user, device,start, end)
        let lastEvent:ActivityOrAction|undefined=undefined
        for (let t=0;t<10; t++) {
            const event:ActivityOrAction|undefined = pickRandomActivity()
            if (event && (!lastEvent || event.name != lastEvent.name)) {
                session.eventTimeline.push(event)
                lastEvent = event
            }
        }
        result.push(session)
    }
    return result

}

const reduceSessions = (sessions:Session[]):AggregateActiviyOrAction[] => {
    let root:AggregateActiviyOrAction = new AggregateActiviyOrAction('NSN',0,[]) // not real, name does not matter

    sessions.forEach(session => {
        let currentNode:AggregateActiviyOrAction = root
        session.eventTimeline.forEach(event => {
            // place this event in this level and move to next level
            let item = currentNode.next.find((node) => node.interaction==event.name)
            if (!item) {
                item = new AggregateActiviyOrAction(event.name,0,[])
                currentNode.next.push(item)
            }
            item.count++
            currentNode = item
        })
    })
    let result = root.next
    result.sort((a,b) => a.count-b.count) // descending size 
    return result
}
class AggregateActiviyOrAction {
    constructor(interation:InteractionName, count:number, next:AggregateActiviyOrAction[]=[]) {
        this.interaction = interation
        this.count = count
        this.next = next
    }
    public count:number
    public interaction:InteractionName
    public next:AggregateActiviyOrAction[]
}

const renderHTML = (roots:AggregateActiviyOrAction[]):string => {
    let html = ""
    const sessions = roots.reduce((prev, curr) => {return prev+curr.count}, 0)
    const dropOuts = sessions - roots.reduce((prev, curr) => {return prev + curr.next.reduce((p,c)=>p+c.count, 0)},0)
    html += `Sessions ${sessions} Drop-outs ${dropOuts}<hr><br>`
    roots.forEach(child => {
        html += renderActivity(child,1)
    })
    return html
}

const renderActivity = (activity:AggregateActiviyOrAction, level:number):string => {
    let html = "<div>"
    for (let n=0; n<level; n++) {
        html += "&nbsp;&nbsp;&nbsp;&nbsp;" // indent
    }
    html += `<span>${activity.interaction}  ${activity.count}</span>`
    activity.next.forEach(child => {
        html += renderActivity(child,level+1)
    })
    html += "</div>"
    return html
}

const getFakeData = () => {
    const fwd = new AggregateActiviyOrAction("IB.fwd", 23211)
    const reply = new AggregateActiviyOrAction("IB.reply", 2011)
    const nsn = new AggregateActiviyOrAction("NSN", 18277)
    const msgCompose = new AggregateActiviyOrAction("MSG.compose", 8772)
    return [
        new AggregateActiviyOrAction("IB", 27232,[fwd, reply]),
        new AggregateActiviyOrAction("MSG", 42227,[msgCompose]),
        new AggregateActiviyOrAction("BTDY", 19327, [nsn]),
    ]
    
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
        // const data = getFakeData()
        const sessions = randomData(100)
        const data = reduceSessions(sessions)
        const html = renderHTML(data)
        res.setHeader("Content-Type", "text/html")
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

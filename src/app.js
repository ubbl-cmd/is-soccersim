const Agent = require('./agent');
const Socket = require('./socket');
const VERSION = 7;

let team = "teamA";

let agent = new Agent();
Socket(agent, team, VERSION)
agent.socketSend("move", `-15 0`)
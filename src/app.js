const Agent = require('./agent');
const VERSION = 7;

let team = "teamA";
let agent = new Agent();

require('./socket')(agent, team, VERSION);
agent.socketSend("move", `-15 0`)
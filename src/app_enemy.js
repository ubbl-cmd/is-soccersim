const Agent = require('./agent');
const Socket = require('./socket');
const VERSION = 7;

let team = "teamB";

let agent = new Agent();
Socket(agent, team, VERSION)
for (let i = 0; i < 100; i++) {
    agent.socketSend("move", '14 1')
}

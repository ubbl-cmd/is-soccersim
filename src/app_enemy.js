const Agent = require('./agent');
const Socket = require('./socket');
const VERSION = 7;

let team = "teamB";

for (let i = 0; i < 1; i++) {
    let agent = new Agent(team, i == 0 ? "goalie" : "atack");
    Socket(agent, team, VERSION, i == 0);
}
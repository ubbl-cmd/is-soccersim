const Agent = require('./agent');
const Socket = require('./socket');
const VERSION = 7;

let team = "teamA";

for (let i = 1; i < 3; i++) {
    setTimeout(
        () => {
            let agent = new Agent(team, i == 0 ? "goalie" : "atack");
            Socket(agent, team, VERSION, i == 0);
        },
        i * 1000
    )
}
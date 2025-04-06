const solo_policy = require('./misc/policies/solo_policy');
const wedge_policy = require('./misc/policies/double_wedge_policy');
const afk_policy = require('./misc/policies/afk_policy');
const goalie_poliy = require('./misc/policies/goalie');

const Agent = require('./agent');
const Socket = require('./socket');
const VERSION = 7;

let team = "teamB";

for (let i = 0; i < 2; i++) {
    let agent = new Agent();
    Socket(agent, team, VERSION, i == 0)

    if (i != 0) {
        agent.dt = Object.assign({}, afk_policy)
        agent.dt.state = { ...agent.dt.state }
    } else {
        agent.dt = Object.assign({}, goalie_poliy)
        agent.dt.state = { ...agent.dt.state }
    }
    agent.dt.state.teamName = team
}

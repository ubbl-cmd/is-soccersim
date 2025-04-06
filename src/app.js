const solo_policy = require('./misc/policies/solo_policy');
const wedge_policy = require('./misc/policies/triple_wedge_policy');
const goalie_poliy = require('./misc/policies/goalie');
const pass_policy = require('./misc/policies/pass_policy');
const zabivator_policy = require('./misc/policies/zabivator_policy');

const Agent = require('./agent');
const Socket = require('./socket');
const VERSION = 7;

let team = "teamA";

for (let i = 1; i < 2; i++) {
    let agent = new Agent();
    Socket(agent, team, VERSION, i == 0)

    // if (i != 0) {
    agent.dt = Object.assign({}, pass_policy)
    agent.dt.state = { ...agent.dt.state }
    agent.dt.state.number = i
    // } else {
    //     agent.dt = Object.assign({}, goalie_poliy)
    //     agent.dt.state = { ...agent.dt.state }
    // }
    agent.dt.state.teamName = team
}
for (let i = 1; i < 2; i++) {
    let agent = new Agent();
    Socket(agent, team, VERSION, i == 0)

    // if (i != 0) {
    agent.dt = Object.assign({}, zabivator_policy)
    agent.dt.state = { ...agent.dt.state }
    agent.dt.state.number = i
    // } else {
    //     agent.dt = Object.assign({}, goalie_poliy)
    //     agent.dt.state = { ...agent.dt.state }
    // }
    agent.dt.state.teamName = team
}

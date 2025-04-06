const Taken = {
    state: {
        teamOwn: [],
        side: undefined,
    },
    setHear(input) {},
    setSee(input, team, side) {
        let gl, gr;

        this.state.time = input[0]
        this.state.lookAroundFlags = {}
        this.state.goalOwn = []
        this.state.goal = undefined
        this.state.ballPrev = this.state.ball
        this.state.ball = undefined
        
        for (let obj of input) {
            if (obj.cmd && obj.p) {
                const name = obj.cmd.p.join('');
                if (name === 'gr') {
                    gr = {f: name, dist: obj.p[0], angle: obj.p[1]};
                } 
                if (name === 'gl') {
                    gl = {f: name, dist: obj.p[0], angle: obj.p[1]};
                }
                if (obj.cmd.p[0] === 'p' && obj.cmd.p.includes(team)) {
                    this.state.teamOwn.push({f: name, dist: obj.p[0], angle: obj.p[1]});
                }
                if (obj.cmd.p[0] == "b" ) {
                    this.state.ball = {f: name, dist: obj.p[0], angle: obj.p[1], distChange: obj.p[2], angleChange: obj.p[3]};
                }
                if (name === 'fprb') {
                    this.state.lookAroundFlags.fprb = {f: name, dist: obj.p[0], angle: obj.p[1]}
                } 
                if (name === 'fprc') {
                    this.state.lookAroundFlags.fprc = {f: name, dist: obj.p[0], angle: obj.p[1]}
                } 
                if (name === 'fprt') {
                    this.state.lookAroundFlags.fprt = {f: name, dist: obj.p[0], angle: obj.p[1]}
                }
            }
        }
        this.state.goalOwn = side === 'l' ? gl : gr
        this.state.goal = side === 'l' ? gr : gl
        this.side = side;

        return this.state
    },
}

module.exports = Taken;
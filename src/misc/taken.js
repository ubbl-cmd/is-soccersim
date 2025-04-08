const Flags = require('./flags')

const Taken = {
    state: {
        teamOwn: [],
        teamEnemy: [],
        side: undefined,
    },
    setHear(input) { },
    setSee(input, team, side) {
        let gl, gr;

        this.state.time = input[0]
        this.state.flags = {}
        this.state.goalOwn = []
        this.state.goal = undefined
        this.state.ballPrev = this.state.ball
        this.state.ball = undefined
        this.state.teamOwn = []
        this.state.teamEnemy = []
        this.state.closest = []
        this.state.closestAlly = []


        for (let obj of input) {
            if (obj.cmd && obj.p) {
                const name = obj.cmd.p.join('');
                if (name === 'gr') {
                    gr = { f: name, dist: obj.p[0], angle: obj.p[1] };
                } else if (name === 'gl') {
                    gl = { f: name, dist: obj.p[0], angle: obj.p[1] };
                } else if (obj.cmd.p[0] === 'p') {
                    console.log(`p: ${name}`);
                    
                    if (obj.cmd.p.includes(`"${team}"`))
                        this.state.teamOwn.push({ f: name, dist: obj.p[0], angle: obj.p[1] });
                    else
                        this.state.teamEnemy.push({ f: name, dist: obj.p[0], angle: obj.p[1] });
                } else if (obj.cmd.p[0] == "b") {
                    this.state.ball = { f: name, dist: obj.p[0], angle: obj.p[1], distChange: obj.p[2], angleChange: obj.p[3] };
                }
                if (obj.cmd.p[0] !== 'p' && obj.cmd.p[0] !== 'b') {
                    this.state.flags[name] = { f: name, dist: obj.p[0], angle: obj.p[1] }
                    if (Flags[name]) {
                        this.state.flags[name].x = Flags[name].x
                        this.state.flags[name].y = Flags[name].y
                    }
                }
            }
        }

        for (let player of this.state.teamOwn) {
            this.state.closestAlly.push(player)
        }
        for (let player of this.state.teamEnemy) {
            this.state.closest.push(player)
        }
        this.state.closest.sort((a, b) => a.dist - b.dist)
        this.state.closestAlly.sort((a, b) => a.dist - b.dist)
        this.state.goalOwn = side === 'l' ? gl : gr
        this.state.goal = side === 'l' ? gr : gl
        this.side = side;

        return this.state
    }
}
function findCoordinates(see_flags) {
    const fv = Object.values(see_flags);
    let min_err = 100000;
    let pos = undefined
    for (let i = 0; i < fv.length; i++) {
        for (let j = i + 1; j < fv.length; j++) {
            if (i == j) continue
            for (let k = j + 1; k < fv.length; k++) {
                if (i == k || j == k) continue
                const temp_pos = positionCalculator(fv[i], fv[j], fv[k]);
                if (temp_pos && (min_err > temp_pos.err || min_err === -1)) {
                    pos = temp_pos
                    min_err = pos.err
                }
            }
        }
    }
    return pos
}

function positionCalculator(d1, d2, d3) {
    const beta1 = (d2.y ** 2 - d1.y ** 2 + d2.x ** 2 - d1.x ** 2 + d1.dist ** 2 - d2.dist ** 2) / 2 / (d2.x - d1.x + 0.01);
    const beta2 = (d3.y ** 2 - d1.y ** 2 + d3.x ** 2 - d1.x ** 2 + d1.dist ** 2 - d3.dist ** 2) / 2 / (d3.x - d1.x + 0.01);
    const alpha1 = (d1.y - d2.y) / (d2.x - d1.x + 0.01);
    const alpha2 = (d1.y - d3.y) / (d3.x - d1.x + 0.01);
    const y = (beta1 - beta2) / (alpha2 - alpha1 + 0.01);
    const x = alpha1 * (beta1 - beta2) / (alpha2 - alpha1 + 0.01) + beta1;
    return { x: x, y: y, err: Math.abs(d1.x ** 2 + d1.y ** 2 - d1.dist ** 2) }
}

function shiftDistance(d1, d2) {
    return Math.sqrt(d1.dist ** 2 + d2.dist ** 2 - 2 * d1.dist * d2.dist * Math.cos(Math.abs(d1.a - d2.a) * 0.0175))
}

module.exports = Taken;
const flags = require('./misc/flags');
const Msg = require('./msg');
const Flags = require('./misc/flags');
const readline = require('readline');

class Agent {
    constructor() {
        this.position = 1;
        this.run = false;
        this.act = null;
        // this.rl = readline.createInterface({
        //     input: process.stdin,
        //     output: process.stdout,
        // });
        // this.rl.on('line', (input) => {
        //     if (this.run) {
        //         if("w" == input) this.act = {n: "dash", v: 100}
        //         if("d" == input) this.act = {n: "turn", v: 20}
        //         if("a" == input) this.act = {n: "turn", v: -20}
        //         if("s" == input) this.act = {n: "kick", v: 100}
        //     }
        // });
    }
    msgGot(msg) {
        let data = msg.toString('utf-8');
        this.proccessMsg(data);
        this.sendMsg();
    }
    setSocket(socket) {
        this.socket = socket;
    }
    socketSend(cmd, value) {
        this.socket.sendMsg(`(${cmd} ${value})`);
    }
    proccessMsg(msg) {
        let data = Msg.parseMsg(msg);
        if (!data) throw new Error('parse error:' + msg);
        if (data.cmd == 'hear') this.run = true;
        if (data.cmd == 'init') this.initAgent(data.p);
        this.analyzeEnv(data.msg, data.cmd, data.p);
    }
    initAgent(p) {
        if (p[0] == 'r') this.position = "r";
        if (p[1]) this.id = p[1];
    }
    analyzeEnv(msg, cmd, p) {
        if (cmd === 'see') {
            let see_flags = {}
            let see_players = {}
            for (let obj of p) {
                if (obj.cmd && obj.p) {
                    const name = obj.cmd.p.join('')
                    if (Flags[name]) {
                        see_flags[name] = {...(Flags[name])};
                        see_flags[name].d = obj.p[0]
                        see_flags[name].a = obj.p[1]
                    }
                    if (obj.cmd.p[1] === '"teamB"') {
                        // console.log(msg)
                        // console.log(obj.p)
                        see_players = {d: obj.p[0], a: obj.p[1]};
                        console.log(see_players, obj.p)
                        
                    }
                }
            }
            const fv = Object.values(see_flags);
            let min_err = 100000;
            for (let i = 0; i < fv.length; i++) {
                for (let j = i+1; j < fv.length; j++) {
                    if (i==j) continue
                    for (let k = j+1; k < fv.length; k++) {
                        if (i == k || j == k) continue
                        const pos = positionCalculator(fv[i], fv[j], fv[k]);
                        // console.log(pos.err)
                        if (min_err > pos.err && Math.abs(pos.x) < 80 && Math.abs(pos.y) < 80) {
                            this.pos = pos
                            min_err = pos.err
                        }
                    }
                }
            }
            console.log(this.pos);
            const copy_flags = {...see_flags}
            const fv1 = Object.values(copy_flags);
            for (let fl of Object.keys(copy_flags)) {
                copy_flags[fl].d = shiftDistance(copy_flags[fl], see_players)
            }
            min_err = 100000;
            for (let i = 0; i < fv1.length; i++) {
                for (let j = i+1; j < fv1.length; j++) {
                    if (i==j) continue
                    for (let k = j+1; k < fv1.length; k++) {
                        if (i == k || j == k) continue
                        const pos = positionCalculator(fv1[i], fv1[j], fv1[k]);
                        // console.log(pos.err)
                        if (min_err > pos.err && Math.abs(pos.x) < 80 && Math.abs(pos.y) < 80) {
                            see_players.x = pos.x
                            see_players.y = pos.y
                            min_err = pos.err
                        }
                        
                    }
                }
            }
            console.log("isBp", see_players)
            
        }
    }
    sendMsg() {
        if (this.run) {
            if (this.act) {
                if (this.act.n == 'kick') {
                    this.socketSend(this.act.n, this.act.v + " 0")
                } else {
                    this.socketSend(this.act.n, this.act.v)
                }
                this.act = null;
            }
        }
    }
}

function positionCalculator(d1, d2, d3) {
    const beta1 = (d2.y ** 2 - d1.y ** 2 + d2.x ** 2 - d1.x ** 2 + d1.d ** 2 - d2.d ** 2) / 2 / (d2.x - d1.x + 0.01);
    const beta2 = (d3.y ** 2 - d1.y ** 2 + d3.x ** 2 - d1.x ** 2 + d1.d ** 2 - d3.d ** 2) / 2 / (d3.x - d1.x + 0.01);
    const alpha1 = (d1.y - d2.y) / (d2.x - d1.x + 0.01);
    const alpha2 = (d1.y - d3.y) / (d3.x - d1.x + 0.01);
    const y = (beta1 - beta2) / (alpha2 - alpha1 + 0.01);
    const x = alpha1 * (beta1 - beta2) / (alpha2 - alpha1 + 0.01) + beta1;
    return {x: x, y: y, err: Math.abs(d1.x ** 2 + d1.y ** 2 - d1.d ** 2)}
}

function shiftDistance(d1, d2) {
    return Math.sqrt(d1.d ** 2 + d2.d ** 2 - 2 * d1.d * d2.d * Math.cos(Math.abs(d1.a - d2.a) * 0.0175))
}

module.exports = Agent;
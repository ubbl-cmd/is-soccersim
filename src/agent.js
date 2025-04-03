const flags = require('./misc/flags');
const Msg = require('./msg');
const Flags = require('./misc/flags');
const readline = require('readline');

class Agent {
    constructor() {
        this.position = 1;
        this.run = false;
        this.act = null;
        this.set_sequence([{ act: 'flag', fl: 'frb' }, { act: 'flag', fl: 'gl' }, { act: 'flag', fl: 'fc' }, { act: 'kick', fl: 'b', goal: 'gr' }])
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
        this.act_boof = []
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
        // console.log(`(${cmd} ${value})`)
        this.socket.sendMsg(`(${cmd} ${value})`);
    }
    proccessMsg(msg) {
        let data = Msg.parseMsg(msg);
        if (!data) throw new Error('parse error:' + msg);
        if (data.cmd == 'init') this.initAgent(data.p);
        this.analyzeEnv(data.msg, data.cmd, data.p);
    }
    initAgent(p) {
        if (p[0] == 'r') this.position = "r";
        if (p[1]) this.id = p[1];
    }
    analyzeEnv(msg, cmd, p) {
        if (cmd === 'hear') {
            console.log(p[1], p[2]);
            if (p[1] == 'referee' && p[2] == 'drop_ball') {

            } else if (p[1] == 'referee' && p[2] == 'play_on') {
                this.run = true;
            } else if (p[1] == 'referee' && (p[2] == 'kick_off_r' || p[2] == 'kick_off_l' || p[2] == 'kick_off_r')) {
                this.run = false;
            } else if (p[1] == 'referee' && p[2].startsWith('goal_')) {
                this.run = false;
                this.sequence_idx = 0;
            } else if (p[1] == 'referee' && p[2].startsWith('half_time')) {
                this.run = false;
            }
        }
        if (cmd === 'see') {
            this.see_flags = {}
            this.see_players = {}
            let ball = null;
            for (let obj of p) {
                if (obj.cmd && obj.p) {
                    const name = obj.cmd.p.join('')
                    if (Flags[name]) {
                        this.see_flags[name] = { ...(Flags[name]) };
                        this.see_flags[name].d = obj.p[0];
                        this.see_flags[name].a = obj.p[1];
                    }
                    if (obj.cmd.p[0] === 'b') {
                        // console.log(obj)
                        ball = {};
                        ball.d = obj.p[0];
                        ball.a = obj.p[1];
                        // console.log(ball)
                    }
                    if (obj.cmd.p[1] === '"teamB"') {
                        this.see_players = { d: obj.p[0], a: obj.p[1] };
                    }
                }
            }
            const fv = Object.values(this.see_flags);
            let min_err = 100000;
            // for (let i = 0; i < fv.length-2; i++) {
            // for (let j = i+1; j < fv.length-1; j++) {
            // for (let k = j+1; k < fv.length; k++) {
            //     if (i == k || j == k) continue
            if (fv.length >= 3) {
                const pos = positionCalculator(fv[0], fv[1], fv[2]);
                if (min_err > pos.err && Math.abs(pos.x) < 80 && Math.abs(pos.y) < 80) {
                    this.pos = pos
                    min_err = pos.err
                }
            }
            // }
            // }
            // }
            // const copy_flags = {...this.see_flags}
            // const fv1 = Object.values(copy_flags);
            // for (let fl of Object.keys(copy_flags)) {
            //     copy_flags[fl].d = shiftDistance(copy_flags[fl], this.see_players)
            // }
            // min_err = 100000;
            // for (let i = 0; i < fv1.length; i++) {
            //     for (let j = i+1; j < fv1.length; j++) {
            //         if (i==j) continue
            //         for (let k = j+1; k < fv1.length; k++) {
            //             if (i == k || j == k) continue
            //             const pos = positionCalculator(fv1[i], fv1[j], fv1[k]);
            //             if (min_err > pos.err && Math.abs(pos.x) < 80 && Math.abs(pos.y) < 80) {
            //                 this.see_players.x = pos.x
            //                 this.see_players.y = pos.y
            //                 min_err = pos.err
            //             }

            //         }
            //     }
            // }
            this.choose_act(this.see_flags, ball)
        }
    }
    sendMsg() {

        if (this.run) {
            if (this.act) {
                if (this.act.n == 'kick') {
                    this.socketSend(this.act.n, this.act.v)
                } else {
                    this.socketSend(this.act.n, this.act.v)
                }
                this.act = null;
            }
        }
    }
    set_sequence(sequence) {
        this.sequence = sequence;
        this.sequence_idx = 0;
    }
    choose_act(see_flags, ball) {
        if (!see_flags) return
        this.act_boof.shift();

        if (this.sequence[this.sequence_idx]["act"] === 'flag') {

            if (see_flags[this.sequence[this.sequence_idx]["fl"]]) {
                // console.log(see_flags[this.sequence[this.sequence_idx]["fl"]])
                if (Math.abs(see_flags[this.sequence[this.sequence_idx]["fl"]].a) > 10) {
                    if (this.act_boof.length === 0) {
                        this.act_boof.push({ n: 'turn', v: see_flags[this.sequence[this.sequence_idx]["fl"]].a });
                    }
                } else if (see_flags[this.sequence[this.sequence_idx]["fl"]].d < 3) {
                    this.sequence_idx = (this.sequence_idx + 1) % this.sequence.length;
                } else if (this.act_boof.length === 0) {
                    this.act_boof.push({ n: 'dash', v: 75 });
                }
            } else if (this.act_boof.length === 0) {
                this.act_boof.push({ n: 'turn', v: 45 });
            }
        }

        if (this.sequence[this.sequence_idx]["act"] === 'kick') {
            if (ball && ball.d && ball.a) {
                if (Math.abs(ball.a) > 10 && this.act_boof.length === 0) {
                    this.act_boof.push({ n: 'turn', v: ball.a });
                } else if (ball.d < 0.5) {
                    if (see_flags[this.sequence[this.sequence_idx]["goal"]]) {
                        this.act_boof.push({ n: 'kick', v: `100 ${see_flags[this.sequence[this.sequence_idx]["goal"]].a}` });
                    } else {
                        this.act_boof.push({ n: 'kick', v: `10 45` });
                    }
                } else if (this.act_boof.length === 0) {
                    this.act_boof.push({ n: 'dash', v: 75 });
                }
            } else {
                if (this.act_boof.length === 0) {
                    this.act_boof.push({ n: 'turn', v: 45 });
                }
            }
        }
        this.act = this.act_boof[0];
    }
}

function positionCalculator(d1, d2, d3) {
    const beta1 = (d2.y ** 2 - d1.y ** 2 + d2.x ** 2 - d1.x ** 2 + d1.d ** 2 - d2.d ** 2) / 2 / (d2.x - d1.x + 0.01);
    const beta2 = (d3.y ** 2 - d1.y ** 2 + d3.x ** 2 - d1.x ** 2 + d1.d ** 2 - d3.d ** 2) / 2 / (d3.x - d1.x + 0.01);
    const alpha1 = (d1.y - d2.y) / (d2.x - d1.x + 0.01);
    const alpha2 = (d1.y - d3.y) / (d3.x - d1.x + 0.01);
    const y = (beta1 - beta2) / (alpha2 - alpha1 + 0.01);
    const x = alpha1 * (beta1 - beta2) / (alpha2 - alpha1 + 0.01) + beta1;
    return { x: x, y: y, err: Math.abs(d1.x ** 2 + d1.y ** 2 - d1.d ** 2) }
}

function shiftDistance(d1, d2) {
    return Math.sqrt(d1.d ** 2 + d2.d ** 2 - 2 * d1.d * d2.d * Math.cos(Math.abs(d1.a - d2.a) * 0.0175))
}

module.exports = Agent;
const Msg = require('./msg');
const Mgr = require('./misc/TA/mgr');
const Flags = require('./misc/flags');
const readline = require('readline');

class Agent {
    constructor(teamName, role) {
        this.role = role;
        this.position = "l";
        this.teamName = teamName;
        this.run = false;
        this.act = null;
        if (this.role == "goalie") {
            this.ta = require('./misc/TA/goalie')
        } else if (this.role == "nothing") {
            this.ta = null
        } else {
            this.ta = require('./misc/TA/atack')
        }
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
        if (data.cmd == 'init') this.initAgent(data.p);
        if (data.cmd == 'hear' && data.p[1] == "referee") {
            this.run = true
            if (data.p[2] == 'play_on') {
                this.run = true
            }
        }
        this.analyzeEnv(data.msg, data.cmd, data.p);
    }
    initAgent(p) {
        if (p[0] == 'r') this.position = "r";
        if (p[1]) this.id = p[1];
    }
    analyzeEnv(msg, cmd, p) {
        if (cmd == "see" && this.run) {
            this.act = Mgr.getAction(p, this.ta, this.teamName, this.position, false)
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
                this.act = null
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
    return { x: x, y: y, err: Math.abs(d1.x ** 2 + d1.y ** 2 - d1.d ** 2) }
}

function shiftDistance(d1, d2) {
    return Math.sqrt(d1.d ** 2 + d2.d ** 2 - 2 * d1.d * d2.d * Math.cos(Math.abs(d1.a - d2.a) * 0.0175))
}

module.exports = Agent;
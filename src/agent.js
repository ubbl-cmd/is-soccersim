const Msg = require('./msg');
const Flags = require('./misc/flags');
const readline = require('readline');
const low = require("./misc/controllers/atack/low")
const middle = require("./misc/controllers/atack/middle")
const high = require("./misc/controllers/atack/high")

class Agent {
    constructor(teamName, role) {
        this.role = role;
        this.position = "l";
        this.teamName = teamName;
        this.run = false;
        this.act = null;
        this.controllers = []
        if (this.role == "goalie") {
            this.controllerLow = require("./misc/controllers/goalie/low");
            this.controllerMiddle = require("./misc/controllers/goalie/middle");
            this.controllerHigh = require("./misc/controllers/goalie/high");
            this.controllers.push(this.controllerLow);
            this.controllers.push(this.controllerMiddle);
            this.controllers.push(this.controllerHigh);
        } else if (this.role == "nothing") {

        } else if (this.role == "atack") {
            this.controllerLow = Object.assign({}, low)
            this.controllerMiddle = Object.assign({}, middle)
            this.controllerHigh = Object.assign({}, high)
            this.controllers.push(this.controllerLow);
            this.controllers.push(this.controllerMiddle);
            this.controllers.push(this.controllerHigh);
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
        console.log(`${this.id}(${cmd} ${value})`);
        
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
        if (this.id == 2) {
            this.controllerMiddle.waitGoal = this.position == "r" ? "fplb" : "fprb"
        }
        if (this.id == 3) {
            this.controllerMiddle.waitGoal = this.position == "r" ? "fplt" : "fprt"
        }
        if (this.id == 4) {
            this.controllerMiddle.waitGoal = this.position == "r" ? "fprb" : "fplb"
        }
        if (this.id == 5) {
            this.controllerMiddle.waitGoal = this.position == "r" ? "fprt" : "fplt"
        }
        if (this.id == 6) {
            this.controllerMiddle.waitGoal = this.position == "r" ? "fc" : "fc"
            this.controllerMiddle.action = "seekBall"
        }
    }
    analyzeEnv(msg, cmd, p) {
        if (cmd == "see" && this.run) {
            this.act = this.controllers[0].execute(p, this.controllers.slice(1), this.teamName, this.position, this.id)
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

module.exports = Agent;
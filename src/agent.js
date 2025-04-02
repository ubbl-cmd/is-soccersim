const Msg = require('./msg');
const readline = require('readline');

class Agent {
    constructor() {
        this.position = 1;
        this.run = false;
        this.act = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        this.rl.on('line', (input) => {
            if (this.run) {
                if("w" == input) this.act = {n: "dash", v: 100}
                if("d" == input) this.act = {n: "turn", v: 20}
                if("a" == input) this.act = {n: "turn", v: -20}
                if("s" == input) this.act = {n: "kick", v: 100}
            }
        });
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
        if (p[0] == 'r') this.position = "r"
        if (p[1]) this.id = p[1]
    }
    analyzeEnv(msg, cmd, p) {}
    sendCmd() {
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
module.exports = Agent;
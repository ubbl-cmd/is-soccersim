class Mgr {
    constructor() {}
    getAction(dt, p) {
        this.p = p;
        this.objects = {}
        for (let obj of this.p) {
            if (obj.cmd && obj.p) {
                const name = obj.cmd.p.join('')
                this.objects[name] = {d: obj.p[0], a: obj.p[1]}
                if (obj.p.length >= 3) {
                    this.objects[name].distChange = obj.p[2];
                }
            }
        }

        const manager = this;
        function execute(dt, title) {
            const action = dt[title];
            if (typeof action.exec == "function") {
                action.exec(manager, dt.state)
                return execute(dt, action.next)
            }
            if (typeof action.condition == "function") {
                const cond = action.condition(manager, dt.state)
                if (cond)
                    return execute(dt, action.trueCond)
                return execute(dt, action.falseCond)
            }
            if (typeof action.command == "function") {
                return action.command(manager, dt.state)
            }
            throw new Error(`Unexpected code in DT: ${title}`)
        }
        return execute(dt, "root")
    }
    getVisible(fl) {
        return this.objects[fl] !== undefined
    }
    getDistance(fl) {
        if (this.getVisible(fl))
            return this.objects[fl].d
    }
    getDistChange(fl) {
        if (this.getVisible(fl))
            if (this.objects[fl].distChange)
                return this.objects[fl].distChange
            return 0
    }
    getAngle(fl) {
        if (this.getVisible(fl))
            return this.objects[fl].a
    }
}

module.exports = Mgr;

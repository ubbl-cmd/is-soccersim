const Taken = require('../../taken')

const GoalieLow = {
    execute(input, controllers, team, side, id) {
        const next = controllers[0]
        this.taken = Taken.setSee(input, team, side)
        this.taken.id = id
        if (this.taken.ball && this.taken.ball.dist < 0.5)
            this.taken.canKick = true
        else
            this.taken.canKick = false

        let temp = false
        if (this.taken.teamOwn.length) {
            this.taken.teamOwn.forEach(player => {
                if (player.dist < 5) {
                    temp = true
                    this.taken.playerClose = true
                }
            })
        }
        if (!temp)
            this.taken.playerClose = false
        else
            this.taken.playerClose = true

        if (this.taken.goal && this.taken.goal.dist < 20) {
            this.taken.nearGoal = true
        }
        if (next)
            return next.execute(this.taken, controllers.slice(1))
    }
}
module.exports = GoalieLow;
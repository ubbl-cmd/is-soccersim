const Taken = require('../../taken')

const GoalieHigh = {
    execute(input, controllers) {
        const immidiate = this.immidiateReaction(input)
        if (immidiate) return immidiate
        const defend = this.defendGoal(input)
        if (defend) return defend
        if (this.last == "defend")
            input.newAction = "return"
        this.last = "previous"
    },
    immidiateReaction(input) {
        if (input.canKick) {
            console.log('can kick');

            this.last = "kick"
            if (input.goal)
                return { n: "kick", v: `100 ${input.goal.angle}` }
            return { n: "kick", v: `10 45` }
        }
        if (this.last == "catch") {
            this.last = "defend"
            return { n: "dash", v: `100 ${input.ball}` }
        }
        if (input.canCatch) {
            console.log('can kick');

            this.last = "catch"
            return { n: "catch", v: input.ball }
        }
    },
    defendGoal(input) {
        if (input.ball) {
            const close = input.closest

            if (close[0] && input.ball.dist < Math.abs(close[0].dist - input.ball.dist) || !close[0] || input.ball.dist < 10) {
                if (input.ball.dist > 20) {
                    return
                }
                this.last = "defend"
                if (Math.abs(input.ball.angle) > 5)
                    return { n: "turn", v: input.ball.angle }
                return { n: "dash", v: 100 }
            }
        }
    }
}
module.exports = GoalieHigh;
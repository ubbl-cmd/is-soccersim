const Taken = require('../../taken')

const GoalieHigh = {
    needToControll: true,
    execute(input, controllers) {

        const immidiate = this.immidiateReaction(input)
        if (immidiate) return immidiate
        this.chooseRole(input)
        if (this.last == "kick")
            input.newAction = "seekBall"
        this.last = "previous"
    },
    immidiateReaction(input) {
        if (input.canKick) {
            input.nearGoal = false
            console.log('can kick');

            this.last = "kick"
            if (input.goal)
                return { n: "kick", v: `100 ${input.goal.angle}` }
            return { n: "kick", v: `10 45` }
        }
    },
    chooseRole(input) {
        const close = input.closestAlly
        console.log('high', input.id, input.playerClose, this.needToControll);
        console.log(close)

        if (input.playerClose) { // Есть игрок рядом
            input.newAction = "comeCloserToGoal"
            this.needToControll = false
            return
        }
        if (input.ball) { // Мяч видно
            if (close[0] && Math.abs(close[0].dist - input.ball.dist) < 10) {
                input.newAction = "comeCloserToGoal"
                this.needToControll = false
                return
            } else if (!this.needToControll && this.nearGoal) {
                input.newAction = "seekBall"
                this.needToControll = true
                return
            }
            
        }
    }
}
module.exports = GoalieHigh;
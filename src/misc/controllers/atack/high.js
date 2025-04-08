const Taken = require('../../taken')
const { seekBall } = require('./middle')

const GoalieHigh = {
    execute(input, controllers) {

        const immidiate = this.immidiateReaction(input)
        if (immidiate) return immidiate
        this.chooseRole(input)
        if (this.last == "kick")
            input.newAction = "seekBall"
        this.last = "previous"
        console.log('h', input.newAction, this.last);

    },
    immidiateReaction(input) {
        if (input.canKick) {
            console.log('can kick');

            this.last = "kick"
            const close = input.closestAlly
            if (input.goal) {
                if (close[0] && close[0].dist < input.goal.dist) {
                    return { n: "kick", v: `${close[0].dist * 2 + 40} ${close[0].angle}` }
                } else {
                    return { n: "kick", v: `100 ${input.goal.angle}` }
                }
            }
            return { n: "kick", v: `10 45` }
        }
    },
    chooseRole(input) {
        const close = input.closestAlly
        if (input.ball) { // Мяч видно
            if (close[0] && (close[0].dist < 3 || input.ball.dist > close[0].dist) && input.action == "seekBall") {
                console.log(input.id, "switch to going to goal");
                input.newAction = "comeCloserToGoal"
            } else if (input.action == "waitBallAction") {
                console.log(input.id, "switch to seek");
                input.newAction = "seekBall"
            }

        }
    }
}
module.exports = GoalieHigh;
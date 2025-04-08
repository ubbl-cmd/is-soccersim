const Taken = require('../../taken')

const AtackMiddle = {
    action: "seekBall",
    nearGoal: false,
    execute(input, controllers) {
        console.log(`${input.id} ${this.action} ${this.nearGoal}`);
        if (this.nearGoal) {
            this.action = "waitBallAction"
        }
        const next = controllers[0]
        switch (this.action) {
            case "seekBall":
                input.cmd = this.seekBall(input);
                break;
            case "comeCloserToGoal":
                input.cmd = this.comeCloserToGoal(input);
                break;
            case "waitBallAction":
                input.cmd = this.waitBallAction(input);
                break;
        }
        input.action = this.action;
        input.nearGoal = this.nearGoal


        if (next) {
            const command = next.execute(input, controllers.slice(1))
            if (command) return command
            if (input.newAction) this.action = input.newAction
            return input.cmd
        }
    },
    seekBall(input) {
        this.nearGoal = false
        if (!input.ball) {
            return { n: "turn", v: 40 }
        }
        if (Math.abs(input.ball.angle) > 10) {
            return { n: "turn", v: input.ball.angle }
        }
        if (input.ball.dist > 0.5) {
            return { n: "dash", v: 75 }
        }
    },
    waitBallAction(input) {
        let ball = input.ball
        if (!ball) {
            return { n: "turn", v: 30 }
        }
        if (Math.abs(ball.angle) > 15) {
            return { n: "turn", v: ball.angle }
        }
        return { n: "turn", v: ball.angle };
    },
    comeCloserToGoal(input) {
        if (!this.nearGoal) {
            let goal = input.goal
            if (!goal) {
                return { n: "turn", v: 40 }
            }
            if (Math.abs(goal.angle) > 10) {
                return { n: "turn", v: goal.angle }
            }
            console.log(`goal dist: ${goal.dist}`);

            if (goal.dist > 20) {
                return { n: "dash", v: 75 }
            }
            this.nearGoal = true
            console.log('iAmNear');
        }
        return this.waitBallAction(input)
    },
}
module.exports = AtackMiddle;
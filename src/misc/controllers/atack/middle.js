const Taken = require('../../taken')

const AtackMiddle = {
    action: "comeCloserToGoal",
    waitGoal: "fglt",
    execute(input, controllers) {
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


        if (next) {
            const command = next.execute(input, controllers.slice(1))
            if (command) return command
            if (input.newAction) this.action = input.newAction
            input.newAction = undefined
            return input.cmd
        }
    },
    seekBall(input) {
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
        console.log("waitBallAction", input.ball);
        
        let ball = input.ball
        if (!ball) {
            return { n: "turn", v: 30 }
        }
        if (Math.abs(ball.angle) > 5) {
            return { n: "turn", v: ball.angle }
        }
        return { n: "turn", v: 0 };
    },
    comeCloserToGoal(input) {
        let goal = input.flags[this.waitGoal]
        console.log(input.id, "comeCloserToGoal", goal);

        if (!goal) {
            return { n: "turn", v: 40 }
        }
        if (Math.abs(goal.angle) > 10) {
            return { n: "turn", v: goal.angle }
        }
        console.log(`goal dist: ${goal.dist}`);

        if (goal.dist > 3) {
            return { n: "dash", v: 75 }
        }
        this.action = 'waitBallAction'
        console.log("wb");
        
    },
}
module.exports = AtackMiddle;
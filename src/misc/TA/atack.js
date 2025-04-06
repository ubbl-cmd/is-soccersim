const TA = {
    current: "start",
    state: {
        variables: {
            dist: null,
        },
        timers: {
            t: 0,
        },
        next: true,
        synch: undefined,
        local: {},
    },
    nodes: {
        start: {
            n: "start",
            e: ["visible", "invisible"]
        },
        visible: {
            n: "visible",
            e: ["far", "close"]
        },
        invisible: {
            n: "invisible",
            e: ["start"]
        },
        close: {
            n: "close",
            e: ["kick"]
        },
        kick: {
            n: "kick",
            e: ["start"]
        },
        far: {
            n: "far",
            e: ["start"]
        },
    },
    edges: {
        start_visible: [
            {
                guard: [
                    {
                        s: "neq",
                        l: { v: "dist" },
                        r: null,
                    }
                ],
            },
        ],
        start_invisible: [
            {
                guard: [
                    {
                        s: "eq",
                        l: { v: "dist" },
                        r: null,
                    }
                ],
            },
        ],
        invisible_start: [
            {
                synch: "lookAround!"
            },
        ],
        visible_far: [
            {
                guard: [
                    {
                        s: "gt",
                        l: {v: "dist"},
                        r: 0.5
                    }
                ]
            }
        ],
        visible_close: [
            {
                guard: [
                    {
                        s: "lte",
                        l: {v: "dist"},
                        r: 0.5
                    }
                ]
            }
        ],
        close_kick: [
            {
                synch: 'kick!',
            },
        ],
        kick_start: [
            {
                synch: 'ok!',
            },
        ],
        far_start: [
            {
                synch: "runToBall!"
            }
        ],
    },
    actions: {
        init(taken, state) {
        },
        beforeAction(taken, state) {
            if (taken.ball) {
                state.variables.prevDist = taken.ball.dist;
                state.variables.dist = taken.ball.dist;
                state.variables.prevAngle = taken.ball.angle;
                state.variables.angle = taken.ball.angle;
            } else {
                state.variables.dist = null;
                state.variables.angle = null;
            }
        },
        kick(taken, state) {
            state.next = true;
            if (!taken.ball) {
                return;
            }
            let dist = taken.ball.dist;
            let goal = taken.goal;
            if (taken.goal == undefined) {
                return { n: "kick", v: "10 45" };
            }            
            return {n: "kick", v: `100 ${taken.goal.angle}`}
        },
        lookAround(taken, state) {
            state.next = false;
            state.synch = "lookAround!"
            if (!state.local.look) {
                state.local.look = "left"
            }
            if (taken.ball) {
                state.next = true;
            }
            let msg = undefined
            switch (state.local.look) {
                case "left":
                    state.local.look = "center";
                    msg = { n: "turn", v: -60 }
                case "center":
                    state.local.look = "right";
                    msg = { n: "turn", v: 60 }
                case "right":
                    state.local.look = "back";
                    msg = { n: "turn", v: 60 }
                case "center":
                    state.local.look = "left";
                    state.next = true;
                    state.synch = undefined;
                    msg = { n: "turn", v: -60 }
                default:
                    state.next = true;
                }
            return msg
        },
        runToBall(taken, state) {
            state.next = false;
            let ball = taken.ball;
            if (!ball) return this.lookAround(taken, state);
            if (ball.dist < 0.5) {
                state.next = true;
                return;
            }
            if (Math.abs(ball.angle) > 10) {
                return { n: "turn", v: ball.angle }
            }
            return { n: "dash", v: 75 }
        },
        ok(taken, state) {
            state.next = true;
            return { n: "turn", v: 0 }
        },
        empty(taken, state) {
            state.next = true;
        },
    },
}

module.exports = TA;
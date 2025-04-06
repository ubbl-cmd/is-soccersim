const FL = 'flag';
const KI = 'kick';

const DT = {
    state: {
        next: 0,
        sequence: [{ act: 'kick', fl: 'b', goal: 'gl' }],
        g: 'gr',
        fpSidec: 'fprc',
        fpSidet: 'fprt',
        fpSideb: 'fprb',
        command: null,
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next];
            state.command = null;
            if (state.next == 0) {
                state.passHeared = false
                passHearedDt = 0
            }
        },
        next: "ballVisible",
    },
    ballVisible: {
        condition: (mgr, state) => {
            console.log(`ballVisible ${mgr.getVisible('b')}`);
            return mgr.getVisible('b')
        },
        trueCond: "ballFar",
        falseCond: "gVisible",
    },
    ballFar: {
        condition: (mgr, state) => {
            return mgr.getDistance('b') > 16
        },
        trueCond: "gVisible",
        falseCond: "rootNext", // ballballPowerRangers
    },
    gVisible: {
        condition: (mgr, state) => mgr.getVisible(state.g),
        trueCond: "gSeek",
        falseCond: "lineVisible",
    },
    gSeek: {
        condition: (mgr, state) => mgr.getDistance(state.g) > 5,
        trueCond: "farG",
        falseCond: "lineVisible",
    },
    farG: {
        condition: (mgr, state) => Math.abs(mgr.getAngle(state.g)) > 4,
        trueCond: "rotateToG",
        falseCond: "runToG",
    },
    rotateToG: {
        exec(mgr, state) {
            state.command = { n: 'turn', v: mgr.getAngle(state.g) }
        },
        next: "sendCommand"
    },
    runToG: {
        exec(mgr, state) {
            state.command = { n: 'dash', v: 100 }
        },
        next: "sendCommand"
    },
    lineVisible: {
        condition: (mgr, state) => mgr.getVisible(state.fpSidec) || mgr.getVisible(state.fpSideb) || mgr.getVisible(state.fpSidet),
        trueCond: "lineSeek",
        falseCond: "rotate",
    },
    lineSeek: {
        condition: (mgr, state) => {
            let cond = true
            if (mgr.getVisible(state.fpSidec)) {
                cond = cond && mgr.getDistance(state.fpSidec) > 12
                cond = cond && mgr.getDistance(state.fpSidec) < 16
            }
            let cond1 = cond
            let cond2 = false
            let cond3 = false
            if (mgr.getVisible(state.fpSideb)) {
                cond = cond && mgr.getDistance(state.fpSideb) > 20
                cond = cond && mgr.getDistance(state.fpSideb) < 28
                cond2 = cond
            }
            if (mgr.getVisible(state.fpSidet)) {
                cond = cond && mgr.getDistance(state.fpSidet) > 20
                cond = cond && mgr.getDistance(state.fpSidet) < 28
                cond3 = cond
            }
            console.log(cond, mgr.getDistance(state.fpSidec), mgr.getDistance(state.fpSideb), mgr.getDistance(state.fpSidet));

            return cond
        },
        trueCond: "rotateToBoal",
        falseCond: "goInGBackwards",
    },
    rotateToBoal: {
        exec(mgr, state) {
            console.log('rotatingToBall');
            if (mgr.getVisible('b')) {
                state.command = { n: 'turn', v: mgr.getAngle('b') }
            } else {
                state.command = { n: 'turn', v: 45 }
            }

        },
        next: "sendCommand"
    },
    goInGBackwards: {
        condition: (mgr, state) => Math.abs(mgr.getAngle(state.fpSidec)) <= 4,
        trueCond: "runBack",
        falseCond: "rotateFpSideC",
    },
    rotateFpSideC: {
        exec(mgr, state) {
            if (mgr.getVisible(state.fpSidec))
                state.command = { n: 'turn', v: mgr.getAngle(state.fpSidec) }
            else
                state.command = { n: 'turn', v: 45 }
        },
        next: "sendCommand"
    },
    runBack: {
        exec(mgr, state) {
            //console.log("goBack")
            state.command = { n: "dash", v: `100 -180` }
        },
        next: "sendCommand"
    },
    rotate: {
        exec(mgr, state) { state.command = { n: 'turn', v: '45' } },
        next: 'sendCommand',
    },
    rootNext: {
        condition: (mgr, state) => state.action.act == FL,
        trueCond: "flagSeek",
        falseCond: "ballSeek",
    },
    flagSeek: {
        condition: (mgr, state) => 3 > mgr.getDistance(state.action.fl),
        trueCond: "closeFlag",
        falseCond: "farGoal",
    },
    closeFlag: {
        exec(mgr, state) {
            state.next++;
            state.action = state.sequence[state.next];
        },
        next: "rootNext",
    },
    farGoal: {
        condition: (mgr, state) => mgr.getAngle(state.action.fl) > 4,
        trueCond: "rotateToGoal",
        falseCond: "runToGoal",
    },
    rotateToGoal: {
        exec(mgr, state) {
            state.command = { n: 'turn', v: mgr.getAngle(state.action.fl) }
        },
        next: "sendCommand"
    },
    runToGoal: {
        exec(mgr, state) {
            state.command = { n: 'dash', v: `50 ${mgr.getAngle(state.action.fl)}` }
        },
        next: "sendCommand"
    },
    sendCommand: {
        command: (mrg, state) => state.command
    },
    ballSeek: {
        condition: (mgr, state) => 2 > mgr.getDistance(state.action.fl),
        trueCond: "catchBall",
        falseCond: "farGoal",
    },
    closeBall: {
        condition: (mgr, state) => {
            return mgr.getVisible(state.action.goal);
        },
        trueCond: "ballGoalVisible",
        falseCond: "ballGoalInvisible",
    },
    catchBall: {
        condition: (mgr, state) => {
            console.log('here', mgr.getDistance('b'), mgr.getDistChange('b'));
            return mgr.getDistance('b') < .5;
        },
        trueCond: "closeBall",
        falseCond: "catchBall2",
    },
    catchBall2: {
        condition: (mgr, state) => {
            console.log('here1', mgr.getDistance('b'), mgr.getDistChange('b'));
            return Math.abs(mgr.getDistChange(state.action.fl)) > 0.1;
        },
        trueCond: "catchBallAction",
        falseCond: "farGoal",
    },
    catchBallAction: {
        exec(mgr, state) {
            state.command = { n: 'catch', v: mgr.getAngle('b') }
        },
        next: "sendCommand",
    },
    ballGoalVisible: {
        exec(mgr, state) {
            console.log(mgr.getDistance('b'));

            state.command = { n: 'kick', v: `100 ${mgr.getAngle(state.action.goal)}` }
        },
        next: "sendCommand",
    },
    ballGoalInvisible: {
        exec(mgr, state) {
            state.command = { n: 'kick', v: '10 45' }
        },
        next: "sendCommand",
    }
}

module.exports = DT;

const FL = 'flag';
const KI = 'kick';

const DT = {
    state: {
        next: 0,
        // sequence: [{ act: 'flag', fl: 'frb' }, { act: 'flag', fl: 'gl' }, { act: 'flag', fl: 'fc' }, { act: 'kick', fl: 'b', goal: 'gr' }],
        sequence: [
            { act: 'flag', fl: 'fplb' },
            { act: 'wait_pass', fl: 'fprb' },
            { act: 'kick', fl: 'b', goal: 'gr' }
        ],
        passHeared: false,
        passHearedDt: 0,
        command: null
    },

    PassSeek: {
        condition: (mgr, state) => {
            if (state.passHeared) return true
            state.passHeared = state.passHeared || mgr.getSound(`"go"`)
            return state.passHeared
        },
        trueCond: "PassSeekTrue",
        falseCond: "PassSeekFalse",
    },
    PassSeekTrue: {
        condition: (mgr, state) => {
            state.passHearedDt++
            console.log(state.passHearedDt);
            
            if (3 < state.passHearedDt) {
                state.action = { n: 'turn', v: 90 }
                return true
            }
            return false
        },
        trueCond: "closeFlagAndSendCommand",
        falseCond: "PassSeekFalse",
    },
    PassSeekFalse: {
        condition: (mgr, state) => 3 > mgr.getDistance(state.action.fl),
        trueCond: "stay",
        falseCond: "farGoal",
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
        next: "sequenceEnded",
    },
    sequenceEnded: {
        condition: (mgr, state) => state.next >= state.sequence.length,
        trueCond: "stay",
        falseCond: "goalVisible",
    },
    stay: {
        exec(mgr, state) { state.command = { n: 'turn', v: '30' } },
        next: 'sendCommand',
    },
    goalVisible: {
        condition: (mgr, state) => mgr.getVisible(state.action.fl),
        trueCond: "rootNext",
        falseCond: "rotate",
    },
    rotate: {
        exec(mgr, state) { state.command = { n: 'turn', v: '90' } },
        next: 'sendCommand',
    },
    rootNext: {
        condition: (mgr, state) => state.action.act == FL,
        trueCond: "flagSeek",
        falseCond: "ballOrPassSeek",
    },
    ballOrPassSeek: {
        condition: (mgr, state) => state.action.act == KI,
        trueCond: "ballSeek",
        falseCond: "PassSeek",
    },
    flagSeek: {
        condition: (mgr, state) => 3 > mgr.getDistance(state.action.fl),
        trueCond: "closeFlag",
        falseCond: "farGoal",
    },
    closeFlag: {
        exec(mgr, state) {
            if (state.next < state.sequence.length) {
                state.next++;
                state.action = state.sequence[state.next];
            }
        },
        next: "rootNext",
    },
    farGoal: {
        condition: (mgr, state) => Math.abs(mgr.getAngle(state.action.fl)) > 4,
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
            state.command = { n: 'dash', v: 100 }
        },
        next: "sendCommand"
    },
    sendCommand: {
        command: (mrg, state) => state.command
    },
    ballSeek: {
        condition: (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
        trueCond: "closeBall",
        falseCond: "farGoal",
    },
    closeBall: {
        condition: (mgr, state) => {
            console.log('is visible?', mgr.getVisible(state.action.goal));
            return mgr.getVisible(state.action.goal);
        },
        trueCond: "ballGoalVisible",
        falseCond: "ballGoalInvisible",
    },
    ballGoalVisible: {
        exec(mgr, state) {
            state.command = { n: 'kick', v: `100 ${mgr.getAngle(state.action.goal)}` }
        },
        next: "sendCommand",
    },
    ballGoalInvisible: {
        exec(mgr, state) {
            console.log("ballGoalInvisible")
            state.command = { n: 'kick', v: '10 45' }
        },
        next: "sendCommand",
    },
    closeFlagAndSendCommand: {
        exec(mgr, state) {
            if (state.next < state.sequence.length) {
                state.next++;
                state.action = state.sequence[state.next];
            }
        },
        next: "sendCommand",
    },
}

module.exports = DT;

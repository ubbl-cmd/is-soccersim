const FL = 'flag';
const KI = 'kick';

const DT = {
    state: {
        next: 0,
        sequence: [{ act: 'flag', fl: 'fplc' }, { act: 'pass', fl: 'b', goal: 'fprb' }, { act: 'sayGo', fl: 'b' }],
        command: null
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
    ballSeekPass: {
        condition: (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
        trueCond: "pass",
        falseCond: "farGoal",
    },
    pass: {
        condition: (mgr, state) => {
            state.mateName = null
            for (let i = 0; i <= 11; i++) {
                mateName = undefined
                if (i == 0) mateName = `p"${state.teamName}"`
                else mateName = `p"${state.teamName}"${i}`
                
                if (mgr.getVisible(mateName)) {
                    state.mateName = mateName
                    return true
                }
            }
            
            return false
        },
        trueCond: "passCondition",
        falseCond: "ballPassInvisible",
    },
    ballPassInvisible: {
        condition: (mgr, state) => mgr.getVisible('fc'),
        trueCond: "passToFc",
        falseCond: "ballGoalInvisible",
    },
    passToFc: {
        exec(mgr, state) { state.command = { n: 'kick', v: `20 ${mgr.getAngle('fc')}` } },
        next: 'sendCommand',
    },
    passCondition: {
        condition: (mgr, state) => {
            return state.mateName != `p"${state.teamName}"` && mgr.getDistance(state.mateName) < 45
        },
        trueCond: "weakPassAction",
        falseCond: "StrongPassAction",
    },
    weakPassAction: {
        exec(mgr, state) { state.command = { n: 'kick', v: `20 ${mgr.getAngle(state.mateName)}` } },
        next: 'sendCommand',
    },
    StrongPassAction: {
        exec(mgr, state) { 
            if (mgr.getVisible(state.action.goal)) {
                state.command = { n: 'kick', v: `100 ${mgr.getAngle(state.mateName)/2 + mgr.getAngle(state.action.goal)/2}` } 
            } else {
                state.command = { n: 'kick', v: `100 ${mgr.getAngle(state.mateName)}` } 
            }
        },
        next: 'closeFlagAndSendCommand',
    },
    sayGo: {
        exec(mgr, state) {
            console.log('saying');
            
            state.command = { n: 'say', v: `go` }
        },
        next: 'closeFlagAndSendCommand'
    },
    sequenceEnded: {
        condition: (mgr, state) => {
            return state.next >= state.sequence.length
        },
        trueCond: "stay",
        falseCond: "goalVisible",
    },
    stay: {
        exec(mgr, state) { state.command = { n: 'turn', v: '0' } },
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
        falseCond: "passOrSay",
    },
    passOrSay: {
        condition: (mgr, state) => {
            
            return state.action.act == 'pass'
        },
        trueCond: "ballSeekPass",
        falseCond: "sayGo",
    },
    flagSeek: {
        condition: (mgr, state) => 3 > mgr.getDistance(state.action.fl),
        trueCond: "closeFlag",
        falseCond: "farGoal",
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
            state.command = { n: 'dash', v: 75 }
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
            state.command = { n: 'kick', v: '10 45' }
        },
        next: "sendCommand",
    },
}

module.exports = DT;

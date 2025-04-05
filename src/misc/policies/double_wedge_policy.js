const FL = 'flag';
const KI = 'kick';

const DT = {
    state: {
        next: 0,
        sequence: [{ act: 'flag', fl: 'frb' }, { act: 'flag', fl: 'gl' }, { act: 'flag', fl: 'fc' }, { act: 'kick', fl: 'b', goal: 'gr' }],
        command: null,
        following: null,
        teamName: `teamA`,
    },
    root: {
        exec(mgr, state) {
            state.action = state.sequence[state.next];
            state.command = null;
        },
        next: "goalVisible",
    },
    mateVisible: {
        condition: (mgr, state) => {
            
            let result = false
            let visibleMates = []
            for (let i = 0; i <= 11; i++) {
                mateName = `p"${state.teamName}"${i}`
                result = result || mgr.getVisible(mateName)
                if (result) visibleMates.push(mateName);
            }
            state.numberSawMates = visibleMates.length;
            // if (state.next == 0 && result) {
            //     state.leader = false
            //     let max = -1
            //     let maxName = null
            //     for (let i of visibleMates) {
            //         if (max < mgr.getDistance(i)) {
            //             max = mgr.getDistance(i)
            //             maxName = i
            //         }
            //     }
            //     state.following = maxName
            // }
            // if (!state.leader) 
            //     return true
            return visibleMates.length > 0
            
        },
        trueCond: "follow",
        falseCond: "rootNext",
    },
    follow: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 11; i++) {
                mateName = `p"${state.teamName}"${i}`
                if (mgr.getVisible(mateName)) {
                    console.log(`following ${mateName}`);
                    
                    return true
                }
            }
            return false
        },
        trueCond: "mateAtPoint",
        falseCond: "", // findLeader
    },
    mateAtPoint: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (state.action.act == FL && mgr.getVisible(mateName) && Math.abs(mgr.getDistance(mateName) - mgr.getDistance(state.action.fl)) < 3) {
                    return true
                }
            }
        },
        trueCond: "closeFlag",
        falseCond: "threeDotTwo",
    },
    threeDotTwo: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) < 1 && (Math.abs(mgr.getAngle(mateName)) < 40)
            }
        },
        trueCond: "threeDotTwoAction",
        falseCond: "threeDotThree",
    },
    threeDotTwoAction: {
        exec(mgr, state) {
            state.command = { n: 'turn', v: 30 }
        },
        next: "sendCommand"
    },
    threeDotThree: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) > 10
            }
        },
        trueCond: "threeDotThreeDotOne",
        falseCond: "threeDotFour",
    },
    threeDotThreeDotOne: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (mgr.getVisible(mateName))
                    return Math.abs(mgr.getAngle(mateName)) > 5
            }
        },
        trueCond: "threeDotThreeDotOneActionTrue",
        falseCond: "threeDotThreeDotOneActionFalse",
    },
    threeDotThreeDotOneActionTrue: {
        exec(mgr, state) {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (mgr.getVisible(mateName))
                    state.command = { n: 'turn', v: mgr.getAngle(mateName) }
            }
        },
        next: "sendCommand"
    },
    threeDotThreeDotOneActionFalse: {
        exec(mgr, state) {
            state.command = { n: 'dash', v: 100 }
        },
        next: "sendCommand"
    },
    threeDotFour: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (mgr.getVisible(mateName))
                    return mgr.getAngle(mateName) > 40 || mgr.getAngle(mateName) < 25
            }
        },
        trueCond: "threeDotFourAction",
        falseCond: "threeDotFive",
    },
    threeDotFourAction: {
        exec(mgr, state) {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (mgr.getVisible(mateName))
                    state.command = { n: 'turn', v: mgr.getAngle(mateName) - 30 }
            }
        },
        next: "sendCommand"
    },
    threeDotFive: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) < 7
            }
        },
        trueCond: "threeDotFiveActionTrue",
        falseCond: "threeDotFiveActionFalse",
    },
    threeDotFiveActionTrue: {
        exec(mgr, state) {
            state.command = { n: 'dash', v: 40 }
        },
        next: "sendCommand"
    },
    threeDotFiveActionFalse: {
        exec(mgr, state) {
            state.command = { n: 'dash', v: 80 }
        },
        next: "sendCommand"
    },
    goalVisible: {
        condition: (mgr, state) => {
            return mgr.getVisible(state.action.fl)
        },
        trueCond: "mateVisible",
        falseCond: "rotate",
    },
    rotate: {
        exec(mgr, state) {
            state.command = { n: 'turn', v: '45' } 
        },
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
            state.next = (state.next + 1) % state.sequence.length;
            state.action = state.sequence[state.next];
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
            state.command = { n: 'dash', v: 40 }
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
        condition: (mgr, state) => mgr.getVisible(state.action.goal),
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
    }
}

module.exports = DT;

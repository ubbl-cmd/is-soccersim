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
                if (mgr.getVisible(mateName)) visibleMates.push(mateName);
            }
            state.numberSawMates = visibleMates.length;
            return visibleMates.length > 0

        },
        trueCond: "mateAtPoint",
        falseCond: "rootNext",
    },
    mateAtPoint: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 11; i++) {
                const mateName = `p"${state.teamName}"${i}`
                if (state.action.act == FL && mgr.getVisible(mateName) && Math.abs(mgr.getDistance(mateName) - mgr.getDistance(state.action.fl)) < 3) {
                    return true
                }
            }
            return false
        },
        trueCond: "closeFlag",
        falseCond: "findMyPlace",
    },

    findMyPlace: {
        condition: (mgr, state) => {
            let result = false
            let visibleMates = []
            for (let i = 0; i <= 11; i++) {
                mateName = `p"${state.teamName}"${i}`
                result = result || mgr.getVisible(mateName)
                if (mgr.getVisible(mateName)) visibleMates.push(mateName);
            }
            state.numberSawMates = visibleMates.length;

            let maxDist = 0
            let followingMate = undefined
            for (let mate of visibleMates) {
                if (maxDist < mgr.getDistance(mate)) {
                    maxDist = mgr.getDistance(mate)
                    state.following = mate
                } else {
                    followingMate = mate
                }
            }
            console.log(`${state.number}: following ${state.following} ${mgr.getAngle(state.following) > 0} ${visibleMates.length}`);
            if (visibleMates.length > 1 && followingMate != undefined) {
                return (Math.sign(mgr.getAngle(state.following)) != Math.sign(mgr.getAngle(followingMate))) == mgr.getAngle(state.following) > 0
            }
            return mgr.getAngle(state.following) > 0
        },
        trueCond: "threeDotTwo",
        falseCond: "threeDotTwoRight",
    },

    threeDotTwo: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) < 1 && (Math.abs(mgr.getAngle(mateName)) < 40)
            }
            return false
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
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) > 10
            }
            return false
        },
        trueCond: "threeDotThreeDotOne",
        falseCond: "threeDotFour",
    },
    threeDotThreeDotOne: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return Math.abs(mgr.getAngle(mateName)) > 5
            }
            return false
        },
        trueCond: "threeDotThreeDotOneActionTrue",
        falseCond: "threeDotThreeDotOneActionFalse",
    },
    threeDotThreeDotOneActionTrue: {
        exec(mgr, state) {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
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
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return mgr.getAngle(mateName) > 40 || mgr.getAngle(mateName) < 25
            }
            return false
        },
        trueCond: "threeDotFourAction",
        falseCond: "threeDotFive",
    },
    threeDotFourAction: {
        exec(mgr, state) {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    state.command = { n: 'turn', v: mgr.getAngle(mateName) - 30 }
            }
        },
        next: "sendCommand"
    },
    threeDotFive: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) < 7
            }
            return false
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

    threeDotTwoRight: {
        condition: (mgr, state) => {
            console.log('right');

            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) < 1 && (Math.abs(mgr.getAngle(mateName)) < 40)
            }
            return false
        },
        trueCond: "threeDotTwoActionRight",
        falseCond: "threeDotThreeRight",
    },
    threeDotTwoActionRight: {
        exec(mgr, state) {
            state.command = { n: 'turn', v: -30 }
        },
        next: "sendCommand"
    },
    threeDotThreeRight: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) > 10
            }
            return false
        },
        trueCond: "threeDotThreeDotOneRight",
        falseCond: "threeDotFourRight",
    },
    threeDotThreeDotOneRight: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return Math.abs(mgr.getAngle(mateName)) > 5
            }
            return false
        },
        trueCond: "threeDotThreeDotOneActionTrueRight",
        falseCond: "threeDotThreeDotOneActionFalseRight",
    },
    threeDotThreeDotOneActionTrueRight: {
        exec(mgr, state) {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    state.command = { n: 'turn', v: mgr.getAngle(mateName) }
            }
        },
        next: "sendCommand"
    },
    threeDotThreeDotOneActionFalseRight: {
        exec(mgr, state) {
            state.command = { n: 'dash', v: 100 }
        },
        next: "sendCommand"
    },
    threeDotFourRight: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return mgr.getAngle(mateName) < -40 || mgr.getAngle(mateName) > -25
            }
            return false
        },
        trueCond: "threeDotFourActionRight",
        falseCond: "threeDotFiveRight",
    },
    threeDotFourActionRight: {
        exec(mgr, state) {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    state.command = { n: 'turn', v: mgr.getAngle(mateName) + 30 }
            }
        },
        next: "sendCommand"
    },
    threeDotFiveRight: {
        condition: (mgr, state) => {
            for (let i = 0; i <= 1; i++) {
                const mateName = state.following
                if (mgr.getVisible(mateName))
                    return mgr.getDistance(mateName) < 7
            }
            return false
        },
        trueCond: "threeDotFiveActionTrueRight",
        falseCond: "threeDotFiveActionFalseRight",
    },
    threeDotFiveActionTrueRight: {
        exec(mgr, state) {
            state.command = { n: 'dash', v: 40 }
        },
        next: "sendCommand"
    },
    threeDotFiveActionFalseRight: {
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
            state.following = null
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

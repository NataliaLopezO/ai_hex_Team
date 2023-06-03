
const Problem = require('ai-agents').Problem;
const getEmptyHex = require('./getEmptyHex');
const gt = require('./goalTest');

class HexGame extends Problem {

    constructor(args) {
        super(args);
        this.env = args;
        this.nTurn = 0;
    }

    /**
     * Check if the given solution solves the problem. You must override
     * @param {Object} solution 
     */
    goalTest(data) {
        return gt(data.world);
    }



    /**
     * The transition model. Tells how to change the state (data) based on the given actions. You must override
     * @param {} data 
     * @param {*} action 
     * @param {*} agentID 
     */
    update(data, action, agentID) {
        let board = data.world;
        let size = board.length;
        
        // As first move, the center is forgiven.
        let checkRule0 = true;
        if (this.nTurn == 0) {
            if (action[0] === Math.floor(size / 2) 
                && action[1] === Math.floor(size / 2)) {
                    checkRule0 = false; 
            }
        }
        // Check if this is legal move?
        if (action[0] >= 0 && action[0] < size 
            && action[1] >= 0 && action[1] < size
            && board[action[0]][action[1]] === 0 && checkRule0) {
                board[action[0]][action[1]] = agentID;
        } else {
            // Make a random move for this player if the movement is not valid
            let available = getEmptyHex(board);
            let move = available[Math.round(Math.random() * ( available.length -1 ))];
            action[0] = Math.floor (move / board.length);
            action[1] = move % board.length;
            board[action[0]][action[1]] = agentID;
        }
        this.nTurn++;
    }

    /**
     * Gives the world representation for the agent at the current stage
     * @param {*} agentID 
     * @returns and object with the information to be sent to the agent
     */
    perceptionForAgent(data, agentID) {
        return data.world.map(arr => arr.slice());
    }

    /**
 * Solve the given problem
 * @param {*} world 
 * @param {*} callbacks 
 */
    solve(world, callbacks) {
        this.controller.setup({ world: world, problem: this });
        this.controller.start(callbacks, false);
    }

    /**
 * Returns an interable function that allow to execute the simulation step by step
 * @param {*} world 
 * @param {*} callbacks 
 */
    interactiveSolve(world, callbacks) {
        this.controller.setup({ world: world, problem: this });
        return this.controller.start(callbacks, true);
    }
}

module.exports = HexGame;

const Agent = require('ai-agents').Agent;
//const solver = require('./solver');
const transposeHex = require('./transposeHex');

class HexAgent extends Agent {
  constructor(value) {
    super(value);
    this.cache = {};
  }

  /**
   * return a new move. The move is an array of two integers, representing the
   * row and column number of the hex to play. If the given movement is not valid,
   * the Hex controller will perform a random valid movement for the player
   * Example: [1, 1]
   */
  send() {
    let id = this.getID()
    let board = this.perception;
    let size = board.length;
    let available = getEmptyHex(board);
    let nTurn = size * size - available.length;

    if (id == '2')
      board = transposeHex(board);

    let move = [0, 0];//minMax(board, nTurn); //[fila, col]

    if (id == '2')
      return [move[1], move[0]];
    else
      return [move[0], move[1]];

  }

}

module.exports = HexAgent;

/**
 * Return an array containing the id of the empty hex in the board
 * id = row * size + col;
 * @param {Matrix} board 
 */
function getEmptyHex(board) {
  let result = [];
  let size = board.length;
  for (let k = 0; k < size; k++) {
    for (let j = 0; j < size; j++) {
      if (board[k][j] === 0) {
        result.push(k * size + j);
      }
    }
  }
  return result;
}

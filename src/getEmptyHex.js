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

module.exports = getEmptyHex;
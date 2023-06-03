/**
 * Transpose and convert the board game to a player 1 logic
 * @param {Array} board 
 */
function transpose(board) {
  let size = board.length;
  let boardT = new Array(size);
  for (let j = 0; j < size; j++) {
      boardT[j] = new Array(size);
      for (let i = 0; i < size; i++) {
          boardT[j][i] = board[i][j];
          if (boardT[j][i] === '1') {
              boardT[j][i] = '2';
          } else if (boardT[j][i] === '2') {
              boardT[j][i] = '1';
          }
      }
  }
  return boardT;
}

module.exports = transpose;
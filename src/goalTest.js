/**
* Check if the given solution solves the problem. You must override
* @param {Object} solution 
*/
function goalTest(tablero) {
  let board = tablero;
  let size = board.length;
  for (let player of ['1', '2']) {
    for (let i = 0; i < size; i++) {
      let hex = -1;
      if (player === '1') {
        if (board[i][0] === player) {
          hex = i * size;
        }
      } else if (player === '2') {
        if (board[0][i] === player) {
          hex = i;
        }
      }
      if (hex >= 0) {
        let row = Math.floor(hex / size);
        let col = hex % size;
        // setVisited(neighbor, player, board);
        board[row][col] = -1;
        let status = check(hex, player, board);
        board[row][col] = player;
        if (status) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Chech if there exist a path from the currentHex to the target side of the board
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
function check(currentHex, player, board) {
  if (isEndHex(currentHex, player, board.length)) {
    return true;
  }
  let neighbors = getNeighborhood(currentHex, player, board);
  for (let neighbor of neighbors) {
    let size = board.length;
    let row = Math.floor(neighbor / size);
    let col = neighbor % size;
    // setVisited(neighbor, player, board);
    board[row][col] = -1;
    let res = check(neighbor, player, board);
    // resetVisited(neighbor, player, board);
    board[row][col] = player;
    if (res == true) {
      return true;
    }
  }
  return false;
}

/**
 * Return an array of the neighbors of the currentHex that belongs to the same player. The 
 * array contains the id of the hex. id = row * size + col
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
function getNeighborhood(currentHex, player, board) {
  let size = board.length;
  let row = Math.floor(currentHex / size);
  let col = currentHex % size;
  let result = [];

  // Check the six neighbours of the current hex
  pushIfAny(result, board, player, row - 1, col);
  pushIfAny(result, board, player, row - 1, col + 1);
  pushIfAny(result, board, player, row, col + 1);
  pushIfAny(result, board, player, row, col - 1);
  pushIfAny(result, board, player, row + 1, col);
  pushIfAny(result, board, player, row + 1, col - 1);

  return result;
}

function pushIfAny(result, board, player, row, col) {
  let size = board.length;
  if (row >= 0 && row < size && col >= 0 && col < size) {
    if (board[row][col] === player) {
      result.push(col + row * size);
    }
  }
}

/**
 * Chech if the current hex is at the opposite border of the board
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Number} size 
 */
function isEndHex(currentHex, player, size) {
  if (player === "1") {
    if ((currentHex + 1) % size === 0) {
      return true;
    }
  } else if (player === "2") {
    if (Math.floor(currentHex / size) === size - 1) {
      return true;
    }
  }
}


module.exports = goalTest;

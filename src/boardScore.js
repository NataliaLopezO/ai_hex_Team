const Graph = require('node-dijkstra');
const transpose = require('./transposeHex');
const crypto = require('crypto');


let cache = {};

function boardScore(board, player) {
  let path0 = boardPath(board);
  let score = 0;
  if (!path0) {
    score = -999999999//(board.length * board.length);
  } else {
    if (path0.length === 2) {
      score = 999999999//(board.length * board.length);
    } else {
      let path1 = boardPath(transpose(board));
      if (!path1) {
        score = 999999999//(board.length * board.length)
      } else {
        score = path1.length - path0.length;
      }
    }
  }
  return player === '1' ? score : -score;
}

function boardScoreNo(board, player) {
  let path0 = boardPath(board);
  let score = 0;
  if (!path0) {
    score = 999999999//(board.length * board.length);
  } else {
    if (path0.length === 2) {
      score = -999999999//(board.length * board.length);
    } else {
      let path1 = boardPath(transpose(board));
      if (!path1) {
        score = -999999999//(board.length * board.length)
      } else {
        score = path1.length - path0.length;
      }
    }
  }
  return player === '1' ? score : -score;
}


function boardPath(board) {
  let player = '1';
  let size = board.length;

  const route = new Graph();

  let neighborsT = {};
  let neighborsX = {};
  cache = {};
  // Build the graph out of the hex board
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let key = i * size + j;
      if (board[i][j] === 0 || board[i][j] === player) {
        let list = getNeighborhood(key, player, board);
        // Cache this result
        //cache[key] = list;
        list = removeIfAny(board, list, i, j);

        //if (key === 5) console.log(list)

        let neighbors = {};
        let sideX = false;
        let sideT = false;
        list.forEach(x => {
          switch (x) {
            case -1:
              neighbors[player + 'X'] = 1;
              neighborsX[key + ''] = 1;
              sideX = sideX || board[i][j] === player;
              break;
            case -2:
              neighbors[player + 'T'] = 1;
              neighborsT[key + ''] = 1;
              sideT = sideT || board[i][j] === player;
              break;
            default:
              neighbors[x + ''] = 1;
          }
        });
        // This case occurs when the game has finished
        if (sideT && sideX) {
          neighborsX[player + 'T'] = 1;
          neighborsT[player + 'X'] = 1;
        }
        route.addNode(key + '', neighbors);
      }
    }
  }

  route.addNode(player + 'T', neighborsT);
  route.addNode(player + 'X', neighborsX);

  //console.log(route)

  return route.path(player + 'T', player + 'X');
}

/**
 * Evita que se consideren las casillas donde el enemigo tiene 2 opciones para cerrar el camino
 * @param {*} board 
 * @param {*} list 
 * @param {*} row 
 * @param {*} col 
 * @returns 
 */
function removeIfAny(board, list, row, col) {
  let size = board.length;
  if (row > 0 && col > 0 && row < size - 1 && col < size - 1 && list.length > 0) {
    if (board[row - 1][col] === 0 && board[row - 1][col - 1] === '2' && board[row][col + 1] === '2') {
      let k = list.findIndex(key => key === (row - 1) * size + col);
      //console.log('x: ' + k + ' ' + ((row - 1) *  size + col));
      //console.log(list);
      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row][col + 1] === 0 && board[row - 1][col] === '2' && board[row + 1][col + 1] === '2') {
      let k = list.findIndex(key => key === row * size + col + 1);
      //console.log('x: ' + k + ' ' + (row *  size + col + 1) );
      //console.log(list);
      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row + 1][col + 1] === 0 && board[row][col + 1] === '2' && board[row + 1][col] === '2') {
      let k = list.findIndex(key => key === (row + 1) * size + col + 1);
      //console.log('x: ' + k + ' ' + ((row + 1) * size + col));
      //console.log(list);
      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row + 1][col] === 0 && board[row + 1][col + 1] === '2' && board[row + 1][col - 1] === '2') {
      let k = list.findIndex(key => key === (row + 1) * size + col);
      //console.log('x: ' + k+ ' ' + ((row + 1) * size + col));
      //console.log(list);
      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row][col - 1] === 0 && board[row + 1][col] === '2' && board[row - 1][col - 1] === '2') {
      let k = list.findIndex(key => key === row * size + col - 1);
      //console.log('x: ' + k + ' ' + (row * size + col - 1));
      //console.log(list);
      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row - 1][col - 1] === 0 && board[row - 1][col] === '2' && board[row][col - 1] === '2') {
      let k = list.findIndex(key => key === (row - 1) * size + col - 1);
      //console.log('x: ' + k + ' ' + ((row - 1) * size + col - 1));
      //console.log(list);
      if (k >= 0)
        list.splice(k, 1);
    }
  }
  return list;
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
  let currentValue = board[row][col];

  board[row][col] = 'x';
  //Check if this value has been precalculated in this turn
  //if (cache[currentHex]) {
  //console.log("From cache")
  //  return cache[currentHex];
  //}

  // Check the six neighbours of the current hex
  pushIfAny(result, board, player, row - 1, col);
  pushIfAny(result, board, player, row - 1, col + 1);
  pushIfAny(result, board, player, row, col + 1);
  pushIfAny(result, board, player, row, col - 1);
  pushIfAny(result, board, player, row + 1, col);
  pushIfAny(result, board, player, row + 1, col - 1);

  // Add the edges if hex is at the border
  if (col === size - 1) {
    result.push(-1);
  } else if (col === 0) {
    result.push(-2);
  }

  board[row][col] = currentValue;

  return result;
}

function pushIfAny(result, board, player, row, col) {
  let size = board.length;
  if (row >= 0 && row < size && col >= 0 && col < size) {
    if (board[row][col] === player || board[row][col] === 0) {
      if (board[row][col] === player) {
        result.push(...getNeighborhood(col + row * size, player, board));
      } else {
        result.push(col + row * size);
      }
    }
  }
}


module.exports = { boardScore, boardScoreNo, boardPath };

/*
board = [[0, 0, 0],
[0, '2', 0],
['1', '1', '1']];
console.log(boardPath(board));
*/

/*
board = [[0, 0, 0],
[0, '2', '1'],
['1', '1', 0]];
console.log(boardScore(board, '2'));  // Debe dar 3 - 1 = 2

board = [[0, 0, '1'],
[0, '2', 0],
['1', 0, 0]];
console.log(boardScore(board, '1'));  // Debe dar 2 - 2 = 0

let board = [[0, '1', '1'],
['2', '2', '2'],
[0, 0, 0]];
console.log(boardScore(board, '2'));

board = [[0, '1', '1'],
['2', '2', '2'],
[0, 0, 0]];
console.log(boardScore(board, '1'));

let board = [[0, '2', '2'],
['1', '1', '1'],
[0, 0, 0]];
console.log(boardScore(board, '1'));

board = [[0, '2', '2'],
['1', '1', '1'],
[0, 0, 0]];
console.log(boardScore(board, '2'));

board = [[0, '2', '2'],
['1', '1', '2'],
['2', '2', 0]];
console.log(boardScore(board, '2'));
/*
board = [[0, '2', '2'],
['1', '1', '2'],
[0, 0, '2']];
console.log(boardScore(board, '2'));
*/
/*let board = [['1', '1', '2'],
             [0,   '2', 0],
             [0,    0,  0]];
console.log(boardScore(board, '2'));

    board = [['1', '1', 0],
             [0,   '2', '2'],
             [0,    0,  0]];
console.log(boardScore(board, '2'));*/

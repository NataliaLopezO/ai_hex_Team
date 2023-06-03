const Agent = require('ai-agents').Agent;
//const solver = require('./solver');
const boardS = require('./boardScore');
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

    return moveGame(board, size, available, nTurn)
    
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




class Arbol {
  constructor(id, padre = null, hijos = [], tablero) {
    this.id = id
    this.padre = padre
    this.hijos = hijos
    this.tablero = tablero
  }

  addChild(id, tablero) {
    const newChild = new Arbol(id)
    newChild.padre = this
    newChild.tablero = tablero
    this.hijos.push(newChild)
  }


}



function moveGame(board, size, available, nTurn) {
  if (nTurn == 0) {
    return [Math.floor(size / 2), Math.floor(size / 2) - 1];
  } else if (nTurn == 1) {
    return [Math.floor(size / 2), Math.floor(size / 2)];
  }


  let profundidad = 10;
  const arbol = new Arbol("root")


  if (nTurn % 2 == 0) {
    arbol.tablero = board
    crearArbol(arbol, 1, profundidad)
    let movimiento = minmax(arbol, profundidad, true, '1')
    return [Math.floor(movimiento / board.length), movimiento % board.length];
  } else {
    arbol.tablero = transposeHex(board)
    crearArbol(arbol, 2, profundidad)
    let movimiento = minmax(arbol, profundidad, true, '2')
    return [movimiento % board.length, Math.floor(movimiento / board.length)];
  }

}

function crearArbol(arbol, jugador, profundidad) {
  let tableroHijo = JSON.parse(JSON.stringify(arbol.tablero));
  let moValidos = boardS.boardPath(arbol.tablero);
  if (profundidad == 0) {
    for (let i = 1; i < moValidos.length - 1; i++) {
      let row = Math.floor(moValidos[i] / arbol.tablero.length)
      let col = moValidos[i] % arbol.tablero.length
      tableroHijo[row][col] = '1'
      arbol.addChild(moValidos[i], tableroHijo)
      tableroHijo = JSON.parse(JSON.stringify(arbol.tablero))
    }
  } else {
    if (moValidos.length > 2) {
      if (moValidos.length == 3) {
        let row = Math.floor(moValidos[1] / arbol.tablero.length)
        let col = moValidos[1] % arbol.tablero.length
        tableroHijo[row][col] = '1'
        arbol.addChild(moValidos[1], tableroHijo)
      } else {

        crearHijos(moValidos, tableroHijo, arbol)

        for (let i = 0; i < arbol.hijos.length; i++) {
          const element = arbol.hijos[i];
          crearArbol(element, jugador, profundidad - 1)
        }
      }
    }
  }
}

function crearHijos(hijos, tableroHijo, padre) {
  hijos.shift()
  hijos.pop()


  while (hijos.length != 0) {
    let row = Math.floor(hijos[0] / tableroHijo.length)
    let col = hijos[0] % tableroHijo.length
    tableroHijo[row][col] = '1'

    padre.addChild(hijos[0], tableroHijo)
    tableroHijo = JSON.parse(JSON.stringify(padre.tablero))
    hijos.shift()
  }
}


function minmax(arbol, profundidad, maxplayer, player, alfa = Number.MIN_SAFE_INTEGER, beta = Number.MAX_SAFE_INTEGER) {
  if (profundidad == 0 || arbol.hijos.length == 0) {

    return boardS.boardScore(arbol.tablero, player)
    
  }

  var bestHeur, valminmax

  if (maxplayer) {
    bestHeur = Number.NEGATIVE_INFINITY;
    let movimiento = arbol.id
    for (const hijo in arbol.hijos) {
      valminmax = minmax(arbol.hijos[hijo], profundidad - 1, false, player)
      if (valminmax >= bestHeur) {
        movimiento = arbol.hijos[hijo].id
      }
      if (valminmax > alfa) {
        alfa = valminmax;
      }
      if (beta <= alfa) {
        break;
      }
      bestHeur = Math.max(valminmax, bestHeur)
    }

    return movimiento
  } else {
    bestHeur = Number.POSITIVE_INFINITY;
    let movimiento = arbol.id

    for (const hijo in arbol.hijos) {
      valminmax = minmax(arbol.hijos[hijo], profundidad - 1, true, player)
      if (valminmax >= bestHeur) {
        movimiento = arbol.hijos[hijo].id
      }
      if (beta > valminmax) {
        beta = valminmax;
      }
      if (beta <= alfa) {
        break;
      }
      bestHeur = Math.max(valminmax, bestHeur)
    }

    return movimiento
  }
}

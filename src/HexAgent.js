const Agent = require('ai-agents').Agent;
const transposeHex = require('./transposeHex');
const Graph = require('node-dijkstra');
const boardS = require('./boardScore');

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
    return [Math.floor(size / 2)+1, Math.floor(size / 2)];
  } else if (nTurn == 1) {
    return [Math.floor(size / 3), Math.floor(size / 3)];
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
  let moValidos = boardPath(arbol.tablero);
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
    //llamado para determinar la utilidad del tablero
    return evaluateBoard(arbol.tablero, player)
    //return boardS.boardScore(arbol.tablero, player)
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

/***************************************************FUNCIONES HEURISTICAS/DE UTILIDAD ***************************/

/**
* 
* Evalúa el estado actual del tablero y devuelve un puntaje de evaluación haciendo un ponderado entre la implementación
* de dos heuristicas/funciones de utilidad, 'calculateShortestDistance' y 'evaluateEdgeControl'.
* 'CalculateShortestDistance' considera la distancia más corta entre el movimiento del jugador y las conexiones 
* ganadoras y 'evaluateEdgeControl' que considera el control de los bordes del tablero por parte del jugador.
*
* @param {Array} board - El estado actual del tablero de juego.
* @param {string} player - El jugador actual.
* @returns {number} - El puntaje de evaluación del tablero.
*/

function evaluateBoard(board, player) {
  let shortDistance = calculateShortestDistance(board, player)
  let distanceWeight = 0.8; 

  let edgeControl = evaluateEdgeControl(board, player)
  let edgeWeight = 0.2; 

  let finalScore = shortDistance * distanceWeight + edgeControl*edgeWeight;
  return finalScore;
}


/**

* Evalúa el control de bordes por parte del jugador en el tablero dado.
* Se asigna un puntaje por cada casilla controlada en los bordes superior e inferior del tablero.
* Entre mas casillas tenga en su poder el jugador mayor sera el puntaje dado por la heuristica/funcion de utilidad.
* @param {Array} board - El estado actual del tablero de juego.
* @param {string} player - El jugador actual.
* @returns {number} - El puntaje de control de bordes del jugador.
*/

function evaluateEdgeControl(board, player) {
  const size = board.length;
  let score = 0;
  // Evaluar los bordes superior e inferior del tablero
  for (let i = 0; i < size; i++) {
    if (board[0][i] === player) {
      score += 1;  // Sumar 1 punto por cada casilla controlada en el borde superior
    }
    if (board[size - 1][i] === player) {
      score += 1;  // Sumar 1 punto por cada casilla controlada en el borde inferior
    }
  }
  return score;
}


/**
* 
* Tiene en cuenta la distancia más corta entre los movimientos del jugador y las conexiones ganadoras en el 
* tablero dado, para determinar un valor de utilidad al tablero dado.
* Entre menor sea la distancia la función o heuristica devuelve una mayor valor de utilidad.
* Utiliza el algoritmo de distancia Manhattan para calcular la distancia.
* Tiene en cuenta una penalizacion para el puntaje que tiene que ver con cuantas conexiones tiene el jugador oponente
* tambien, entre mas conexiones tenga menor va a ser el puntaje del jugador. 
* @param {Array} board - El estado actual del tablero de juego.
* @param {string} player - El jugador actual.
* @returns {number} - El valor de utilidad basado en la distancia más corta.
*/

function calculateShortestDistance(board, player) {
  const size = board.length;
  let score = 0;
  // Obtener el camino desde el jugador hasta las conexiones ganadoras
  const path = boardPath(board);

  // Si no hay un camino, el jugador actual pierde, se puede devolver un valor de utilidad bajo
  if (!path) {
    score= -999999999;
  }else{
    // Calcular la distancia más corta entre los movimientos del jugador y las conexiones ganadoras
    let shortestDistance = Infinity;

    // Iterar sobre cada celda en el tablero
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Solo considerar las celdas vacías o pertenecientes al jugador
        if (board[i][j] === 0 || board[i][j] === player) {
          const sideX = board[i][j] === player;
          const sideT = board[i][j] === player;

          
          if (sideT && sideX) {
            // La celda actual está conectada tanto a la conexión ganadora X como a la conexión ganadora T
            // El jugador actual ha ganado, se puede devolver un valor de utilidad alto
            score = 999999999;
          } else {
            // La celda actual no está conectada a ambas conexiones ganadoras
            // Calcular la distancia a la conexión ganadora más cercana
            let distanceToWinningConnection = Infinity;

            // Iterar sobre cada conexión ganadora en el camino
            for (let k = 0; k < path.length; k++) {
              const connection = path[k];

              // Calcular la distancia Manhattan entre la celda actual y la conexión ganadora
              const distance = Math.abs(i - connection[0]) + Math.abs(j - connection[1]);

              // Actualizar la distancia más corta si se encontró una distancia más pequeña
              if (distance < distanceToWinningConnection) {
                distanceToWinningConnection = distance;
                
              }
            }
            // Actualizar la distancia más corta si se encontró una distancia más pequeña
            if (distanceToWinningConnection < shortestDistance) {
              shortestDistance = distanceToWinningConnection;
              score += 1/shortestDistance;
            }
          }
        }
      }
    }

    if (score != 999999999){
      const opponent = player === '1' ? '2' : '1';
      const opponentScore = calculateShortestDistance(board, opponent);
      const center = Math.floor(size / 2);
      const opponentCenterControl = board[center][center] === opponent ? 0.1 : 0.0;
      score = score - (opponentScore + opponentCenterControl) ;
    }

  }
  // Devolver un valor de utilidad basado en la distancia más corta
  return score;
}


/*******************************************************FUNCIONES AUXILIARES ******************************* */

//Estas funciones ya se encontraban implementadas dentro del codigo del proyecto en el archivo boardScore.js


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
      
        list = removeIfAny(board, list, i, j);

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
  
      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row][col + 1] === 0 && board[row - 1][col] === '2' && board[row + 1][col + 1] === '2') {
      let k = list.findIndex(key => key === row * size + col + 1);

      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row + 1][col + 1] === 0 && board[row][col + 1] === '2' && board[row + 1][col] === '2') {
      let k = list.findIndex(key => key === (row + 1) * size + col + 1);

      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row + 1][col] === 0 && board[row + 1][col + 1] === '2' && board[row + 1][col - 1] === '2') {
      let k = list.findIndex(key => key === (row + 1) * size + col);

      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row][col - 1] === 0 && board[row + 1][col] === '2' && board[row - 1][col - 1] === '2') {
      let k = list.findIndex(key => key === row * size + col - 1);

      if (k >= 0)
        list.splice(k, 1);
    }
    if (board[row - 1][col - 1] === 0 && board[row - 1][col] === '2' && board[row][col - 1] === '2') {
      let k = list.findIndex(key => key === (row - 1) * size + col - 1);

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

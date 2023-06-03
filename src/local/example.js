const HexGame = require('../HexGame');
const HextAgent = require('../HexAgent');//require('./HexAgent');
const HextAgent2 = require('../HexAgent1');//require('./HexAgent');
const HextAgentR = require('../HexAgentRandom');


console.log(HextAgent);

var problemContainer = new HexGame({});

problemContainer.addAgent("1", HextAgent, { play: true });
problemContainer.addAgent("2", HextAgentR, { play: false });

/* q  
let map = [[0, '2', '1'],
[0, '2', '2'],
[0, '1', 0]];*/


let size = 7;
let map = new Array(size);
for (let i = 0; i < size; i++) {
  map[i] = new Array(size);
  for (let j = 0; j < size; j++) {
    map[i][j] = 0;
  }
}

this.state = { squares: map };
let that = this;
this.iterator = problemContainer.interactiveSolve(map, {
  onFinish: (result) => {
    let squares = JSON.parse(JSON.stringify(result.data.world));
    console.log(result.actions[result.actions.length - 1]);
    console.log("Winner: " + result.actions[result.actions.length - 1].agentID);
    //console.log(result.data.world);
  },
  onTurn: (result) => {
    let squares = JSON.parse(JSON.stringify(result.data.world));
    console.log(result.actions[result.actions.length - 1]);
  }
});

while (this.iterator.next());

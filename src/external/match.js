
const HexGame = require('../HexGame');
const fs = require('fs');

function match(agentA, agentB, path) {
  const ids = { "1": agentA, "2": agentB };

  const HexAgent1 = eval(fs.readFileSync(path + '/HexAgent' + agentA + '.js').toString())('/src/HexAgent.js');
  const HexAgent2 = eval(fs.readFileSync(path + '/HexAgent' + agentB + '.js').toString())('/src/HexAgent.js');

  var problemContainer = new HexGame({});

  problemContainer.addAgent("1", HexAgent1, { play: true });
  problemContainer.addAgent("2", HexAgent2, { play: false });

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
      fs.writeFileSync('./matches/' + agentA + "_" + agentB + ".json", JSON.stringify(result.actions));
      console.log(agentA + '\t' + agentB + '\t' + ids[result.actions[result.actions.length - 1].agentID]);
      //console.log("Winner: " + result.actions[result.actions.length - 1].agentID);
      // console.log(result.data.world);
    },
    onTurn: (result) => {
    }
  });

  while (this.iterator.next());
}

module.exports = match;



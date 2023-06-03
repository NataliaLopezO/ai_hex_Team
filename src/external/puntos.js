const fs = require('fs');
let lines = fs.readFileSync('src/external/resultados2023.txt').toString()

puntos = {};

matches = lines.split('\n')
for (let i = 0; i < matches.length; i += 2) {
  let ida = matches[i].split(/[\t]+/);
  let vuelta = matches[i + 1].split(/[\t]+/);
  if (ida[2] == vuelta[2]) {
    if (!puntos[ida[2]]) {
      puntos[ida[2]] = 0;
    }
    puntos[ida[2]] += 3;
  } else {
    if (!puntos[ida[0]]) {
      puntos[ida[0]] = 0;
    }
    puntos[ida[0]] += 1;

    if (!puntos[ida[1]]) {
      puntos[ida[1]] = 0;
    }
    puntos[ida[1]] += 1;
  }

}
console.log(puntos)


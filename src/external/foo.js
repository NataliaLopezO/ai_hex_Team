process.on('uncaughtException', function (err) {
  if (err instanceof ReferenceError) {
    console.log("Reference error xx");
  } else if (err instanceof TypeError) {
    console.log("Reference error xeex");
  } else if (err instanceof RangeError) {
    throw "Range error";
  } else {
    throw "Unknown error";
  }
});

let a = [1, 2]
console.log(a[-1] / 0)
const dfd = require('danfojs-node');

async function testMethods() {
  const data = {
    'Hours_Studied': [10, 15, null, 20, NaN, 25],
    'Scores': [85, 90, 78, null, 88, 92]
  };

  const df = new dfd.DataFrame(data);

  console.log("Methods available on DataFrame:");
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(df)));
}

testMethods();

const dfd = require("danfojs-node")

let data = {
    "A": [30, 1, 2, 3],
    "B": [34, 4, 5, 6],
    "C": [20, 20, 30, 40]
}

let df = new dfd.DataFrame(data)
df.print()

let new_col = [1, 2, 3, 4]
df.addColumn("D", new_col, { inplace: true });

df.print()
const express = require("express");
const main = require("./Controllers/main.js");


const app = express();

app.get("/I/want/title", main.SolveTaskThirdPromises);

app.listen(3030, () => {
    console.log("Server started at port 3030");
});

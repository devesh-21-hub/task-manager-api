const app = require("./app");
const http = require("http");
const cluster = require("node:cluster");
const numCPUs = require("node:os").cpus().length; //8
const process = require("node:process");

const port = process.env.PORT;

http.createServer(app).listen(port, () => {
  //console.log("Server listening on port " + process.env.PORT);
});

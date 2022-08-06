const app = require("./app");
const http = require("http");
const cluster = require("node:cluster");
const numCPUs = require("node:os").cpus().length; //8
const process = require("node:process");

const port = process.env.PORT;

if (cluster.isPrimary) {
  //console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    //console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer(app).listen(port, () => {
    //console.log("Server listening on port " + process.env.PORT);
  });

  //console.log(`Worker ${process.pid} started`);
}

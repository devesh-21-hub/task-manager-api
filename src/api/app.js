const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../test.env"),
});

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Register routers
const tasks = require("./routes/tasks");

app.use("/tasks", tasks);

const users = require("./routes/users");
app.use(users);

module.exports = app;

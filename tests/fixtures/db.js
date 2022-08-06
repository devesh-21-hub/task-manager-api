const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/users");
const Task = require("../../src/models/tasks");

const userOneId = new mongoose.Types.ObjectId();
const userOneToken = jwt.sign(
  { _id: userOneId.toString() },
  process.env.JWT_SECRET
);

const userOne = {
  _id: userOneId,
  name: "Person 1",
  email: "person1@tm.com",
  password: "person1@tm.com",
  age: 24,
  tokens: [{ token: userOneToken }],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwoToken = jwt.sign(
  { _id: userTwoId.toString() },
  process.env.JWT_SECRET
);

const userTwo = {
  _id: userTwoId,
  name: "Person 2",
  email: "person2@tm.com",
  password: "person2@tm.com",
  age: 25,
  tokens: [{ token: userTwoToken }],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First task",
  status: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second task",
  status: true,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third task",
  status: true,
  owner: userTwo._id,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();

  await new User(userOne).save();
  await new User(userTwo).save();

  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOne,
  userOneId,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
};

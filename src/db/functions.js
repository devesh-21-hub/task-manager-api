require("./mongoosedb");
const User = require("../models/users");
const Task = require("../models/tasks");

const addUser = async (user) => {
  try {
    const newUser = new User(user);
    //First save user
    const savedUser = await newUser.save();
    //Now generate a token
    const token = await savedUser.generateAuthToken();
    return { savedUser, token };
  } catch (err) {
    return err.message;
  }
};

const findUserForLogin = async (email, password) => {
  try {
    //findByCredentials is defined by us in models.js/users.js, we can pick any name
    const user = await User.findByCredentials(email, password);
    return user;
  } catch (err) {
    return err.message;
  }
};

const addTask = async (task) => {
  try {
    const newTask = new Task(task);
    const result = await newTask.save();
    return result;
  } catch (err) {
    return err;
  }
};

//READ

const showTasks = async (id) => {
  try {
    const data = await Task.find({ owner: id });

    return data;
  } catch (err) {
    return err.message;
    //return err.message;
  }
};

const showFilteredTasks = async (query) => {
  try {
    const data = await Task.find(query);

    return data;
  } catch (err) {
    return err.message;
  }
};

const showUsers = async (callback) => {
  try {
    const result = await User.find();
    callback(undefined, result);
  } catch (err) {
    callback(err.message, undefined);
  }
};

const showUser = async (userId, callback) => {
  try {
    //const id = new ObjectId(userId);
    const result = await User.findById(userId);
    console.log(result);
    callback(undefined, result);
  } catch (err) {
    callback(err.message, undefined);
  }
};

const getUserAvatar = async (id) => {
  const user = await User.findById(id);
  return user.avatar;
};

const getUserVideo = async (id) => {
  const user = await User.findById(id);
  return user.video;
};

const showTask = async (query) => {
  try {
    const result = await Task.findOne(query);
    return result;
  } catch (err) {
    return err;
  }
};

//UPDATE

const updateUser = async (id, properties) => {
  const updates = Object.keys(properties);

  try {
    const user = await User.findById(id);
    //Use bracket notation to dynamically set the properties
    updates.forEach((update) => (user[update] = properties[update])); //Update only those properties which are provided, here user.update=properties.update won,t work

    // Here before saving the document, we are running middleware userSchema.pre("save", async function (next) {...});
    //that lets us hash the password if it is created or updated

    await user.save();
    //console.log(user);
    return user;
  } catch (err) {
    return err.message;
  }
};

const updateTask = async (id, properties) => {
  try {
    const result = await Task.findByIdAndUpdate(id, properties, {
      new: true,
      runValidators: true,
    });
    return result;
  } catch (err) {
    return err.message;
  }
};

const updateTaskUsingFindById = async (query, properties) => {
  const updates = Object.keys(properties);
  try {
    const task = await Task.findOne(query);
    updates.forEach((update) => (task[update] = properties[update]));
    await task.save();
    return task;
  } catch (err) {
    return err.message;
  }
};

//updateAgeAndCount returns a promise, so use another async function to call it or use then()
const updateAndCount = async (id, properties) => {
  try {
    const user = await User.findByIdAndUpdate(id, properties, {
      new: true,
      runValidators: true,
    });
    return user;
    // console.log(result1);
    // const count = await User.countDocuments({ age });
    // return count;

    //console.log("result of updateAndCount: " + result2);
  } catch (err) {
    console.log(err.message);
  }
};

const deleteAndCount = (id) => {
  Task.findByIdAndDelete(id)
    .then((result) => {
      console.log("result: " + result);
      return Task.countDocuments({ status: true });
    })
    .then((result2) => {
      console.log("result of deleteAndCount: " + result2);
      //return result2;
    })
    .catch((err) => console.error(err));
};

//DELETE

const deleteTask = async (query) => {
  try {
    //const result = await Task.deleteOne({ _id: taskId });
    const result = await Task.findOneAndDelete(query);

    return result;
  } catch (err) {
    return err.message;
  }
};

const deleteUser = async (userId) => {
  try {
    // const result = await User.deleteOne({ _id: userId });
    const result = await User.findByIdAndDelete(userId);
    return result;
  } catch (err) {
    return err.message;
  }
};
//Export

module.exports = {
  addUser,
  addTask,
  showTasks,
  showUsers,
  findUserForLogin,
  getUserAvatar,
  getUserVideo,
  showTask,
  showUser,
  updateUser,
  updateAndCount,
  deleteAndCount,
  updateTask,
  updateTaskUsingFindById,
  showFilteredTasks,
  deleteTask,
  deleteUser,
};

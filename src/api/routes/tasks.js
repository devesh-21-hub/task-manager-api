const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");

const {
  addTask,
  showTasks,
  showTask,
  updateTask,
  updateTaskUsingFindById,
  showFilteredTasks,
  deleteTask,
} = require("../../db/functions");

router.use((req, res, next) => {
  //console.log("Time: ", Date.now());
  next();
});

// for localhost:8000/tasks/test
router.get("/test", (req, res) => {
  res.send("Hello from task router");
});

//Here parent root is /tasks, i.e. each root in this file is served through /tasks route

//POST
//Similar to router.post("/tasks",(req, res) => {})
router.post("/", auth, async (req, res) => {
  try {
    const task = { ...req.body, owner: req.user._id };
    const result = await addTask(task);
    console.log(result);
    result
      ? res.status(201).send({ result })
      : res.status(400).send("Can't add task!");
  } catch (error) {
    console.log(error);
  }
});

//GET

//GET /tasks?completed=true
//GET /tasks?limit=5&skip=2
//GET /tasks?sort

router.get("/", auth, async (req, res) => {
  try {
    //req.query.completed will be a string, not a boolean
    const sort = {};

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      //Here we can't use . as the data is dynamic
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    if (req.query.completed !== "true" && req.query.completed !== "false")
      return res.status(400).json("Bad Request");

    const filter = req.query.completed === "true";

    const id = req.user._id.toString();
    const query = { owner: req.user._id, status: filter };
    const tasks = await showFilteredTasks(query);
    let tasksToReturn;
    //res.status(200).json(tasks);

    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);

    if (req.query.limit === undefined && req.query.skip === undefined) {
      res.status(200).json(tasks);
    }

    if (req.query.limit === undefined) {
      limit = 10;
      tasksToReturn = tasks.splice(skip, limit);
    }

    if (req.query.skip === undefined) {
      tasksToReturn = tasks.splice(0, limit);
    }

    tasksToReturn = tasks.splice(skip, limit);
    res.status(200).json(tasksToReturn);

    /* await req.user
      .populate({
        path: "tasks",
        match: { completed: filter },
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
    // or sort:{status:1}

    //or sort:{sort}
    /*
    sort:{
            createdAt:1,
          }
    
    */
  } catch (err) {
    console.log(err);
  }
});

//For /tasks/all

router.get("/all", auth, async (req, res) => {
  try {
    const id = req.user._id.toString();
    const tasks = await showTasks(id);

    // const tasks = await req.user.populate("tasks").execPopulate();
    tasks.length ? res.json(tasks) : res.json({ message: "No tasks found" });
    // console.log(req.user.tasks);
    // res.json(req.user.tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong from our side!" });
  }
});

//For /tasks/:taskId
router.get("/:taskId", auth, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await showTask({ _id: taskId, owner: req.user._id });
    !task
      ? res.status(404).json({ message: "Task not found!" })
      : res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong from our side!" });
  }
});

//PUT

router.patch("/:taskId", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "status"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).json({ message: "Invalid property update" });
  }

  const taskId = req.params.taskId;
  const query = { _id: taskId, owner: req.owner._id };
  const properties = req.body;

  try {
    //const task = await updateTask(taskId, properties);
    const task = await updateTaskUsingFindById(query, properties);
    task === null
      ? res.status(404).json({ message: "Task not found" })
      : task === undefined
      ? res.status(400).json({ message: "Task id is invalid" })
      : res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//DELETE

router.delete("/:taskId", auth, async (req, res) => {
  const taskId = req.params.taskId;
  const query = { _id: taskId, owner: req.user._id };
  try {
    const result = await deleteTask(query);
    result === null
      ? res.status(404).json({ message: "Task not found" })
      : result === undefined
      ? res.status(400).json({ message: "Invalid task-id" })
      : res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

//Export the route
module.exports = router;

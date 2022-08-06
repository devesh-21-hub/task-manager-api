const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const User = require("./users");

/**
 *
 * @task {
 * description:"Some description",
 * status:true,
 * }
 *
 */

const taskSchema = new Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    status: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

//Create Model from the above Schema

const Task = mongoose.model("Task", taskSchema); //tasks collection

module.exports = Task;

const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const validator = require("validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./tasks");

/**
 *
 * @user {
 * name:"John",
 * email:"john@example.com",
 * password:"passworddfsd788#$%",
 * age:23,
 * }
 */

// if you want the user to login with user-id, implement the logics similar to email login as below
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(
            "Invalid email address, please enter a valid email address"
          );
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password should not be password ");
        }
      },
    },
    age: {
      type: Number,
      default: 18,
      validate(value) {
        if (value < 0)
          throw new Error("Invalid age value, age should be positive");
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
    video: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

//Set a virtual property that will be a relationship between the User and their tasks
//Similar to adding a virtual field to the userSchema
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// password and tokens fields will be deleted automatically when express will parse the user object to JSON
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  delete userObject.video;

  return userObject;
};

//userSchema.methods is a middleware method that works on every User instance
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "2 weeks",
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//userSchema.statics is a middleware method that is accessible on User model
//findByCredentials() runs in findUserForLogin in functions.js
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User with the email " + email + " not found");

  //Compare the password against the hash stored in the database
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Incorrect password");
  return user;
};

//Hash the password at the time of POST and PATCH requests using mongoose middleware, middleware runs before and after some functions like save(), etc...
//This saves us from writing code to hash the password at the time of POST and PATCH requests individually
//We can now write hashing logic once that applies whenever the password is updated or a new user is created

// Use function keyword because arrow functions does not bind with this keyword
// next() is basically all the functions that will be executed after the middleware

//Below middleware function runs before user.save()
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Delete user task when the user is deleted
//userSchema.post("delete", async function (next) {});
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

//Create Model from the above Schema

const User = mongoose.model("User", userSchema); //users collection

//userSchema.post("save", async function (next) {...}); this function will run after the user.save() method

module.exports = User;

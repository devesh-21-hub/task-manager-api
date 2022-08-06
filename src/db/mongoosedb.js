const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const { ObjectId } = require("mongoose");

//To avoid deprecration warnings
//Below option is not supported from v6
// const options = {
//   useNewUrlParser: true,
//   useFindAndModify: false,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
// };

// To create index {useCreateIndex: true}

mongoose.connect(process.env.MONGODB_URL);

//Create  Schemas

//Create documents for all Models and insert them into the database

const express = require("express");

const multer = require("multer");

const router = express.Router();

const sharp = require("sharp");

const {
  addUser,
  showUsers,
  showUser,
  updateUser,
  updateAndCount,
  findUserForLogin,
  getUserAvatar,
  getUserVideo,
  deleteUser,
} = require("../../db/functions");

//Require the middleware function
const auth = require("../../middlewares/auth");

const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../../emails/accounts");

router.use((req, res, next) => {
  next();
});

//POST
router.post("/users", async (req, res) => {
  try {
    //Let the user login and generate an auth token at the time of signing up
    const { savedUser: user, token } = await addUser(req.body);
    // sendWelcomeEmail(user.email, user.name);
    user
      ? res.status(201).json({ user, token })
      : res.status(400).json({ message: "Cant add user" });
    //console.log(user, token);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserForLogin(email, password);
    const token = await user.generateAuthToken();
    user
      ? res.status(200).send({ user, token })
      : res.status(404).json({ message: "Can't find user" });
  } catch (err) {
    res.status(400).json("Incorrect Password");
  }
});
//This is a protected route

//Logout from web, i.e remove the token from the database that is received via headers
router.post("/users/logout", auth, async (req, res) => {
  try {
    //In the tokens array remove that token which is just stored in req.token in auth then save the user
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.status(200).json({ message: "User logged out" });
  } catch (err) {
    res.status(500).json({ message: "Some thing went wrong" });
  }
});

//Lougout from all devices
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    //In the tokens array remove that token which is just stored in req.token in auth then save the user
    req.user.tokens = [];
    await req.user.save();
    res.status(200).json({ message: "User logged out" });
  } catch (err) {
    res.status(500).json({ message: "Some thing went wrong" });
  }
});

//GET

router.get("/", (req, res) => {
  res.json("Hello from backend!");
});
router.get("/users", (req, res) => {
  const Users = showUsers((err, users) => {
    err
      ? res.status(500).json({ message: "Something went wrong from our side!" })
      : res.json(users);
  });
});

//Login a user

//Pass the auth middleware function as an argument to run on every get request of the route "/users/me"
router.get("/users/me", auth, (req, res) => {
  res.json(req.user);
});

// router.get("/users/:userId", (req, res) => {
//   const userId = req.params.userId;
//   const user = showUser(userId, (err, user) => {
//     err
//       ? res.status(500).json({ message: "Something went wrong from our side!" })
//       : user === null
//       ? res.status(404).json({ message: "User not found!" })
//       : res.json(user);
//   });
// });

//PATCH

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  //every returnes true if every update is true
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  //This makes sure that invalid properties are not updated
  if (!isValidOperation) {
    return res.status(400).json({ message: "Invalid property update" });
  }
  const userId = req.params.userId;
  const properties = req.body; // properties to update
  try {
    //const user = await updateUser(req.user._id, properties);
    updates.forEach((update) => (req.user[update] = properties[update]));
    await req.user.save();

    req.user === null
      ? res.status(404).json({ message: "User not found" })
      : req.user === undefined
      ? res.status(400).json({ message: "User id is invalid" })
      : res.json(req.user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//DELETE

router.delete("/users/me", auth, async (req, res) => {
  try {
    //req.user is set in auth.js
    //const result = await deleteUser(req.user._id);
    //Remove the user from the database

    const result = await req.user.remove(); //remove is provided by mongoose

    //sendCancellationEmail(req.user.email, req.user.name);

    result === null
      ? res.status(404).json({ message: "User not found" })
      : result === undefined
      ? res.status(400).json({ message: "Invalid user-id" })
      : res
          .status(200)
          .json(req.user, { message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//limit filesize to 2 mb

const upload = multer({
  dest: "public/pdfs",
  limits: {
    filesize: 2000000,
  },
  fileFilter(req, file, cb) {
    //endsWith(".pdf")
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      return cb(new Error("Please provide a pdf file"));
    }
    //Accept the file
    cb(null, true);
  },
});

const uploadAvatar = multer({
  limits: {
    filesize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
      return cb(new Error("Image format should be jpg, png, or jpeg"));

    cb(null, true);
  },
});

const uploadVideo = multer({
  limits: {
    filesize: 10000000,
  },
});

//multer will receive the file(s) from the input field with name picture and will save it to images folder
router.post(
  "/users/uploads",
  upload.single("picture"),
  (req, res) => {
    res.status(200).json({ message: "Image uploaded successfully" });
  },
  (err, req, res, next) => {
    res
      .status(400)
      .json({ error: err.message, message: "Something went wrong" });
  }
);

router.post(
  "/users/me/avatar",
  auth,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize(180, 180)
      .png()
      .toBuffer();
    //req.user.avatar = req.file.buffer;

    req.user.avatar = buffer;

    await req.user.save();

    res.status(200).json({ message: "Avatar uploaded successfully" });
  },
  (err, req, res, next) => {
    res
      .status(400)
      .json({ error: err.message, message: "Something went wrong" });
  }
);

// Upload video

router.post(
  "/users/me/videos",
  auth,
  uploadVideo.single("video"),
  async (req, res) => {
    req.user.video = req.file.buffer;
    await req.user.save();
    res.status(200).json({ message: "Video uploaded successfully" });
  },
  (err, req, res, next) => {
    res
      .status(400)
      .json({ error: err.message, message: "Something went wrong" });
  }
);

// content type =video/mp4

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();

  res.status(200).json({ message: "Avatar deleted successfully" });
});

router.get("/users/me/avatar", auth, async (req, res) => {
  res.set("Content-Type", "image/png").send(req.user.avatar);
});

router.get("/users/:id/avatar", async (req, res) => {
  //Open http://localhost:8000/users/62cc155e1af97fe28f271c18/avatar to see the avatar of user with id 62cc155e1af97fe28f271c18
  //<img src="http://localhost:8000/users/62cc155e1af97fe28f271c18/avatar" />
  const avatar = await getUserAvatar(req.params.id);
  res.set("Content-Type", "image/png").send(avatar);
});

//Get the video
router.get("/users/:id/video", async (req, res) => {
  // Get the video at http://localhost:8000/users/62cc155e1af97fe28f271c18/video for the user with id 63cc155e1af97fe28f271c18
  const video = await getUserVideo(req.params.id);
  res.set("Content-Type", "video/mp4").send(video);
});

//Export the route
module.exports = router;

/*

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>
<video width="620" height="340" controls autoplay>
  <source src="http://localhost:8000/users/62cc155e1af97fe28f271c18/video" type="video/mp4">
Your browser does not support the video tag.
</video>
</body>
</html>



*/

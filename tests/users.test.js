const request = require("supertest");
const app = require("../src/api/app");
const User = require("../src/models/users");

//expect(user).to.be.an.instanceof(User);

//Never call .end() if you use promises
/*
    .end(function (err, res) {
      if (err) throw err;
    });
*/

const { userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should sign up a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Testt8 User",
      email: "testuser@test",
      password: "teuser@test",
    })
    .expect(200);

  //Assert that the database is updated correctly

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
});

test("should login in an existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("should not sign in a non-existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "testusdtder@test",
      password: "tsdyfjghk489632",
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete the user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userId);
  expect(user).toBeNull();
});

test("Should not delete the account of unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

//expect.any(String)

//Update's test

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Doremon",
    })
    .expect(200);

  const user = await User.findById(userId);
  expect(user.name).toEqual("Doremon");
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "Osaka",
    })
    .expect(401);
});

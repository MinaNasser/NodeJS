const express = require("express");
const app = express();
const port = 3000;

const logger = require("./logging");
const routeCounter = require("./routeCounter");
const passwordService = require("./passHandler");
const fs = require("fs");




app.use(logger);        

app.use(routeCounter);  


app.get("/", (req, res) => {
  res.send("Home Page");
});

app.get("/about", (req, res) => {
  res.send("About Page");
});


app.get("/welcome/:username", (req, res) => {
  const { username } = req.params;
  res.send(`Welcome ${username}`);
});

/*
ii)	get method “/register/:email/:password”, then hash password and save user in array json file 
*/

let users = [];
app.get("/register/:email/:password", (req, res) => {
  const { email, password } = req.params;
  const hashedPassword = passwordService.hashPassword(password);
  const user = { email, hashedPassword };
  users.push(user);
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  res.send("User registered successfully");
});

app.get("/login/:email/:password", (req, res) => {
  const { email, password } = req.params;
  users = JSON.parse(fs.readFileSync("users.json"));
  const user = users.find((user) => user.email === email);
  const hashedPassword = passwordService.comparePassword(password,user.hashedPassword);
  if (user&&hashedPassword) {
    res.send("Login successful");
  } else {
    res.send("Invalid email or password");
  }
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

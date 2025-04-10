const express = require("express");
const app = express();
const port = 3000;

const logger = require("./logging");
const routeCounter = require("./routeCounter");

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
app.get("/register/:email/:password", (req, res) => {
  const { email, password } = req.params;
  const hashedPassword = hashPassword(password);
  const user = { email, hashedPassword };
  users.push(user);
  res.send("User registered successfully");
});

/*
iii)	get method “/login/:email/:password”, then check if user exist and password is correct
*/






app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

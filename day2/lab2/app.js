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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

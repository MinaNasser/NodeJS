const fs = require("fs");
const bcrypt = require("bcrypt");
const askOp = require("./askOperation");
const pa = require("./passOperation");

async function promptLogin() {
  console.log("\n--- Login ---");
  console.log("Enter your username and password to login.");
  console.log("----------------------------------");

  const usernameInput = await askOp.ask("Enter your username: ");
  const passwordInput = await askOp.ask("Enter your password: ");

  let users = [];
  try {
    const data = fs.readFileSync("users.json", "utf8");
    users = JSON.parse(data);
  } catch (err) {
    console.error("Error reading users.json:", err);
    return;
  }

  const foundUser = users.find(u => u.username === usernameInput);

  if (!foundUser) {
    console.log(" User not found.");
    return;
  }

  const isMatch = await pa.comparePassword(passwordInput, foundUser.password);

  if (isMatch) {
    console.log(" Login successful!");
  } else {
    console.log(" Incorrect password.");
  }
}

module.exports = promptLogin;

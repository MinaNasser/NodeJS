const fs = require("fs");
const readline = require("readline");
const registerUser = require("./register");
const promptLogin = require("./login");
const askOp = require("./askOperation");
const logAction = require("./log");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


async function showMenu() {
  console.log("\n--- User Management CLI ---");
  console.log("1. Register a user");
  console.log("2. List all users");
  console.log("3. Login");
  console.log("4. Exit");

  const choice = await askOp.ask("Enter your choice: ");

  switch (choice) {
    case "1":
      logAction("Register User");
      await registerUser();
      await showMenu(); // الرجوع للقائمة بعد التسجيل
      break;
    case "2":
      logAction("List Users");
      listUsers();
      break;
    case "3":
      logAction("Login");
      await promptLogin();
      await showMenu();
      break;
    case "4":
      logAction("Exit");
      console.log("Goodbye!");
      rl.close();
      process.exit(0);
    default:
      console.log("Invalid option");
      await showMenu(); 
  }
}

function listUsers() {
  if (!fs.existsSync("users.json")) {
    console.log("No users found.");
    return showMenu();
  }

  const data = fs.readFileSync("users.json", "utf8").trim();
  if (!data) {
    console.log("No users found.");
    return showMenu();
  }

  let users = [];
  try {
    users = JSON.parse(data);
  } catch (err) {
    console.error("Failed to parse users.json:", err);
    return showMenu();
  }

  console.log("\n--- Registered Users ---");
  users.forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username}, Registered At: ${user.registeredAt}`);
  });

  showMenu();
}

showMenu();

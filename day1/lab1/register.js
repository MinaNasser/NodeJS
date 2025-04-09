const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const askOp = require("./askOperation");
const passwordUtils = require("./passOperation");

async function registerUser() {
    const username = await askOp.ask("Enter username: ");
    const plainPassword = await askOp.ask("Enter password: ");
    const hashedPassword = await passwordUtils.hashPassword(plainPassword);

    const newUser = {
        username: username,
        password: hashedPassword,
        registeredAt: new Date().toISOString()
    };

    let users = [];
    try {
        if (fs.existsSync("users.json")) {
            const data = fs.readFileSync("users.json", "utf8").trim();
            if (data) {
                users = JSON.parse(data);
            }
        }
    } catch (err) {
        console.error("Error reading users.json:", err);
    }

    users.push(newUser);

    fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log("User registered successfully.");
        }
    });
    rl.close();
}

module.exports = registerUser;
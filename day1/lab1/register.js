const fs = require('fs');
const bcrypt = require('bcrypt');
//add input interface
const readLine = require('readline');
const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});
//

// FUnction to hash a password
function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}
//function to ask user for input
function ask(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}
//function to register a user
async function registerUser() {
    const username = await ask("Enter username: ");
    const password = await ask("Enter password: ");
    const hashedPassword = await hashPassword(password);
    const user = {
        username: username,
        password: hashedPassword,
        registeredAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(user) + "\n";
    fs.appendFile("users.json", jsonString, (err) => {
        if (err) {
            console.error(" Error writing to file:", err);
        } else {
            console.log(" User registered successfully.");
            rl.close();
            process.exit(0);
        }
    });
}

module.exports = registerUser;
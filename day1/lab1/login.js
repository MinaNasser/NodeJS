const fs = require("fs");
// import from Prompt.js
const prompt = require("./prompt");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function logUserInfo() {
  rl.question("How many users will be registered? ", async (countStr) => {
    const count = parseInt(countStr);
    const logStream = fs.createWriteStream("log.txt", { flags: "a" });

    for (let i = 0; i < count; i++) {
      await new Promise((resolve) => {
        rl.question(`Enter name for user ${i + 1}: `, (name) => {
          rl.question(`Enter age for user ${i + 1}: `, (ageStr) => {
            const age = parseInt(ageStr);
            const status = age >= 18 ? "Adult" : "Underage";
            const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
            const logEntry = `[${timestamp}] Name: ${name}, Age: ${age}, Status: ${status}\n`;
            logStream.write(logEntry);
            console.log(" Logged:", logEntry.trim());
            resolve();
          });
        });
      });
    }

    logStream.end();
    promptLogin();
  });
}
module.exports = logUserInfo;



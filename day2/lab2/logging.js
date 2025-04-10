// logging.js
const fs = require("fs");
const path = require("path");



const logger = (req, res, next) => {
  const time = new Date().toISOString();
  const logMessage = `[${time}] ${req.method} ${req.originalUrl}`;
  const logFilePath = path.join(__dirname, "access.log");

  fs.appendFile(logFilePath, logMessage + "\n", (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
  fs.writeFile("app.json", JSON.stringify(logMessage, null, 2), (err) => {
    if (err) {
        console.error("Error writing to file:", err);
    } else {
        console.log("Logging successfully.");
    }
  });

  next();
};


module.exports = logger;


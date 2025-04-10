// logging.js
const fs = require("fs");
const path = require("path");

const logger = (req, res, next) => {
  const time = new Date().toISOString();
  const log = `[${time}] ${req.method} ${req.originalUrl}\n`;
  const logFilePath = path.join(__dirname, "access.log");
  fs.appendFile(logFilePath, log, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });

  next();
};

module.exports = logger;

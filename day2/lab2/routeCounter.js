
const fs = require("fs");
let routeVisits;
const routeCounter = (req, res, next) => {
  const route = req.originalUrl;
    try {
      const data = fs.readFileSync("app2.json", "utf8");
      routeVisits   = JSON.parse(data);
    } catch (err) {
      console.error("Error reading app.json:", err);
      return;
    }
  if (!routeVisits[route]) {
    routeVisits[route] = 1;
  } else {
    routeVisits[route]++;
  }

  console.log(`Route "${route}" visited ${routeVisits[route]} time(s)`);
  fs.writeFileSync("app2.json", JSON.stringify(routeVisits), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("Logging successfully.");
    }
  });
  next();
};

module.exports = routeCounter;

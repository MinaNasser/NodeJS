require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000
const http = require("http");
const { Server } = require("socket.io");
const myServer = http.createServer(app);
const io = new Server(myServer);

app.use(express.static("public"))
app.get('/', (req, res) => res.send('Hello World!'))

io.on('connection', function (socket) {
    console.log("connected", socket.id)

    socket.on("send msg", function (msg) {
        console.log(msg)
    })
}
)
const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

myServer.listen(port, () => console.log(`Example app listening on port ${port}!`))

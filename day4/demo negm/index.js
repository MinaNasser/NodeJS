const express = require('express')
const http = require('http');
const app = express()
const httpServer = http.createServer(app);
const { Server } = require('socket.io')
const io = new Server(httpServer);
const port = 3000
const Joi = require('joi');
const DB = require('./DB');
DB.connectDB();
const multer = require('multer');
const User = require('./Models/User');
const { asyncWarpper } = require('./utils/errHandler');
const { APIError } = require('./utils/ApiError');
const Schema = Joi.object({
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    age: Joi.number().required()
})
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded());
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        const nameFile = new Date().toISOString() + file.originalname;
        cb(null, nameFile);
    }

})
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => res.send('Hello World!'))
app.post("/add-file", upload.single("file"), asyncWarpper(async function (req, res) {

    const { name, age } = req.body;
    const flag = await Schema.validateAsync({ name, age });
    console.log(flag)
    const imgUrl = req.file.path


    // const data = User.create({ name, age, image: imgUrl })
    // console.log(data);

    res.send('ok');

}))

io.on("connection", function (socket) {
    console.log("some one connect to your server", socket.id);
    socket.on("send msg", function (data) {
        socket.broadcast.emit('recv msg', data);
    })
    // socket.on('fire', function (data) {
    //     console.log(data);
    // })
})

app.use((err, req, res, next) => {

    const error = new APIError("not found", 404);
    res.status(error.status).json(error.message);
})
httpServer.listen(port, () => console.log(`Example app listening on port ${port}!`))
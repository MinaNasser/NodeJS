const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
let users = [];
app.use(express.static('static'));
app.use(express.urlencoded());
app.use(express.json());
app.use(function (req, res, next) {
    console.log("hi from gate :)");
    // logic 
    next();
})
function userVlid(req, res, next) {
    console.log("hi from user gate")
    next();
}
app.get("/", function (req, res) {
    res.redirect('index.html')
})
app.get("/index", function (req, res) {
    res.send("hi from server");
})
app.get("/add-user", function (req, res) {
    const { user, pass, age } = req.query;
    console.log(user, pass, age)
    res.status(200).send('added :)');
})
app.get("/users", userVlid, function (req, res) {
    res.send(users);
})
app.post('/add-user', function (req, res) {

    console.log(req.body);
    var token = jwt.sign(req.body, "privateKey");
    console.log(token)
    users.push(req.body);
    res.status(201).json({
        msg: "added",
        token: token

    })
})

app.delete('/users/:id', function (req, res) {
    const { id } = req.params;
    users = users.filter((item, index) => index != id - 1);
    res.send(users);
})

app.post("/users/enc", function (req, res) {

    const { token } = req.body;

    let data = jwt.verify(token, "privateKey")

    res.send(data)
})

app.patch('/users/:id', function (req, res) {
    const { id } = req.params;
    const obj = req.body;
    users = users.map((item, index) => {
        if (index == id - 1) {
            return { ...item, ...obj }
        }
        else return item
    })
    res.send(users);
})
app.put("/users/:id", function (req, res) {
    const { id } = req.params;
    const obj = req.body;
    users[id - 1] = obj;
    res.send(users);
})







app.use(function (req, res) {

    res.send("Not Found");
})

app.listen(4000, function () {
    console.log("server is run now");
})
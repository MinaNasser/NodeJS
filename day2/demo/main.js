const express = require('express');
const app = express();
let users = ["ahmed", "ali", "negm", "ramdan"]
const path = require('path')


app.use(express.static("static"));
app.use(function (req, res, next) {
    console.log("hi from midlware");
    next();
})
app.get('/', function (req, res) {
    res.send("index")
})


app.get("/index", (req, res) => {
    // let mypath = path.join(__dirname, "static", "index.html");
    // console.log(mypath);

    // res.sendFile(mypath);
    res.redirect("/index.html")
})
app.get('/users', (req, res) => {

    res.send(users);
})

app.get('/users/:x', function (req, res) {
    let index = req.params.x;
    res.send(users[index]);

})

app.get('/home', function (req, res) {
    res.send("Home")
})


app.listen(3000, () => {
    console.log("server is listen")
})
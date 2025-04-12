const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.static('static'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let users = [];
function userValidation(req,res,next){
    console.log('User Validation');
    next();
}
app.get('/',function(req,res){
    res.redirect('index.html');
})

app.get("/index", (req, res) => {
    // let mypath = path.join(__dirname, "static", "index.html");
    // console.log(mypath);

    // res.sendFile(mypath);
    res.redirect("/index.html")
})
// app.get('/users',userValidation,function(req,res){
//     res.send('Login');
// })
// app.get('/users/:id',function(req,res){
//     res.send(req.params.id);
// })
// app.get("/add-user", function (req, res) {
//     const username = req.query.username;
//     const password = req.query.password;
//     const age = req.query.age;
//     console.log(username, password, age);
//     const user = {
//         username: username,
//         password: password,
//         age: age
//     }
//     res.send(user);
// });
app.get("/users", function (req, res) {
    res.send(users);
});
app.post("/add-user", function (req, res) {
    const user = req.body;

    users.push(user);

    const token = jwt.sign(user, 'secretkey');

    res.status(201).send({
        message: "User added",
        token: token
    });
});


// app.get("/users/:id", function (req, res) {
//     const id = req.params.id;
//     const user = users[id];
//     res.send(user);
// });
// app.put("/users/:id", function (req, res) {
//     const id = req.params.id;
//     const user = users[id];
//     const username = req.body.username;
//     const age = req.body.age;
//     user.username = username;
//     user.age = age;
//     res.send(user);
// });
app.delete("/users/:id", function (req, res) {
    const id = req.params.id;
    const user = users.filter((user) => user.id != id);

    users.splice(id, 1);
    res.send(user);
})
app.put("/users/:id", function (req, res) {
    const id = req.params.id;
    const user = users.filter((user) => user.id != id);
    const username = req.body.username;
    const age = req.body.age;
    user.username = username;
    user.age = age;
    res.send(user);
});
app.patch('/todos/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    let todos = [];
    try {
        todos = JSON.parse(fs.readFileSync('todos.json', 'utf-8'));
    } catch (err) {
        return res.status(500).send({ error: "Failed to read todos" });
    }

    let found = false;
    todos = todos.map(todo => {
        if (todo.id === parseInt(id)) {
            found = true;
            return { ...todo, ...updateData };
        }
        return todo;
    });

    if (!found) {
        return res.status(404).send({ error: "todo not found" });
    }

    fs.writeFileSync('todos.json', JSON.stringify(todos, null, 2));
    res.status(200).send({ message: "todo updated successfully", todos });
});


app.put("/users/:id", function (req, res) {
    const { id } = req.params;
    const obj = req.body;

    const index = users.findIndex(user => user.id === parseInt(id));

    if (index === -1) {
        return res.status(404).send({ message: "User not found" });
    }

    users[index] = { id: parseInt(id), ...obj };

    res.send(users[index]);
});


app.post("/users/enc", function (req, res) {
    const {token} = req.body;
    const decoded = jwt.verify(token, 'secretkey');
    res.send(decoded);

})









app.use(function(req,res,next){
    res.send('Not Found');
})
app.listen(3000,function(){
    console.log('Server is running');
})
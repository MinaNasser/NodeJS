const express = require('express');
const jwt = require('jsonwebtoken');
const fs=require('fs');

const app = express();
const secretKey = 'secretAl5al';
app.use(express.json());
const port = 3000
app.get('/', (req, res) => {
    res.send('Hello World!')
})
/*
- Register a user with the following required attributes Username,password , firstName
Notes: 
- Write the user to a file
- Return ({message:”user was registered and token  successfully”}) if success
- Return ({error:”{Attribute name} is required” if there is a validation error with 422 status code 


*/
// let users = [];


app.post('/user/register', (req, res) => {
    const { username, password, firstName } = req.body;
    if (!username) {
        return res.status(422).send({ error: "username is required" });
    }
    if (!password) {
        return res.status(422).send({ error: "password is required" });
    }
    if (!firstName) {
        return res.status(422).send({ error: "firstName is required" });
    }

    const user = {
        username,
        password,
        firstName
    };
    let users = [];
    try {
        const data = fs.readFileSync('users.json', 'utf-8');
        users = JSON.parse(data);
    } catch (err) {
        users = [];
    }

    users.push(user);
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2)); 
    const token = jwt.sign({ username, password }, secretKey);

   
    res.status(201).send({ message: "user was registered and token successfully", token });
});
app.post('/user/login', (req, res) => {
    const { username, password, tokenIncome } = req.body;
    if (!username) {
        return res.status(422).send({ error: "username is required" });
    }
    if (!password) {
        return res.status(422).send({ error: "password is required" });
    }
    if (!tokenIncome) {
        return res.status(422).send({ error: "token is required" });
    }
    let users = [];
    try {
        const data = fs.readFileSync('users.json', 'utf-8');
        users = JSON.parse(data);
    } catch (err) {
        return res.status(500).send({ error: "Error reading users file" });
    }
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {

        var  obj  =  jwt.verify(tokenIncome, secretKey)
        if (obj.username !== username && obj.password !== password) {
            return res.status(401).send({ error: "Invalid token" });
        }
        else{
            res.status(200).send({
                message: "logged in successfully",
                profile: { name: username },
            });
        }
    } else {
        res.status(401).send({ error: "invalid credentials" });
    }
});

app.get('/todos',(req,res)=>{
    try {
        const data = fs.readFileSync('todos.json', 'utf-8');
        const todos = JSON.parse(data);
        res.status(200).send(todos);
    } catch (err) {
        res.status(500).send({ error: "Error reading todos" });
    }
})

app.post('/todos',(req,res)=>{
    const {title ,status} = req.body;
    if(!title){
        res.status(422).send({ error: "title is required" });
    }
    let todos=[];
    try {
        const data = fs.readFileSync('todos.json', 'utf-8');
        todos = JSON.parse(data);
    } catch (err) {
        res.status(500).send({ error: "Error reading todos" });
    }


    const todo ={
        id:todos.length+1,
        title,
        status
    }
    todos.push(todo);
    fs.writeFileSync('todos.json',JSON.stringify(todos));
    res.status(201).send({ message: "todo created successfully" });

})
// Put	/todos/:id	Return the todo with the given id
app.get('/todos/:id',(req,res)=>{
    const id = req.params.id;
    try {
        const data = fs.readFileSync('todos.json', 'utf-8');
        const todos = JSON.parse(data);
        const todo = todos.find(todo => todo.id === parseInt(id));
        if(!todo){
            res.status(404).send({ error: "todo not found" });
        }
        res.status(200).send(todo);
    } catch (err) {
        res.status(500).send({ error: "Error reading todos" });
    }
})
// delete	/todos/:id	


app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let todos = JSON.parse(fs.readFileSync('todos.json', 'utf-8'));

    const newTodos = todos.filter(t => t.id !== id);
    if (newTodos.length === todos.length) {
        return res.status(404).send({ error: "todo not found" });
    }

    fs.writeFileSync('todos.json', JSON.stringify(newTodos, null, 2));
    res.status(200).send({ message: "todo deleted successfully" });
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


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
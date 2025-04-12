const express = require('express'); //import 
const path=require("path")// work with file and folder paths 

 let arr=[{name:"ahmed",age:20},{name:"ali",age:20},{name:"sayed",age:20}]
 const app=express(); // create server or web app


app.use(express.urlencoded({extended:true})) // gate
app.use(function(req,res,next)
{

    if(req.body.user=="negm")
    {
    console.log("frist thing in server");
    next();
    }
    else if(req.url=='/index')
    {
        next();
    }
    else
    res.status(403).send("not auth");

})
 app.get('/',function(req,res)
 {
    res.send("hallo in express app")
 })

app.get('/home',function(req,res)
{
    res.send("<h1>hi from home endpoint</h1>")
})
app.get("/users/:id/:name",function(req,res) // params === parmaters of functions
{
console.log(req.params) //object has all params 

let index=req.params.id-1;
    if(index>=arr.length)
    {
        res.status(404).send("not found")
    }
    else
    res.send(arr[index]);
});
app.get('/index',function(req,res)
{

    console.log(path.join(__dirname,"index.html"))
    res.sendFile(path.join(__dirname,"index.html"));
    
})
let users=[]
app.get('/adddata',function(req,res)
{

    console.log(req.query)

    users.push(req.query);
    res.send("data is saved");
})

app.get("/getusers",function (req,res) {
    res.send(users);
})

app.post("/adddata",function(req,res)
{
    console.log(req.headers);
    res.send("data is saved");
})
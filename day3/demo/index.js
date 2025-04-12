const express = require('express');
const app = express();





function userValidation(req,res,next){
    console.log('User Validation');
    next();
}

app.get('/index',function(req,res){
    res.send('Hello');
})
app.get('/users',userValidation,function(req,res){
    res.send('Login');
})




app.use(function(req,res,next){
    res.send('Not Found');
})
app.listen(3000,function(){
    console.log('Server is running');
})
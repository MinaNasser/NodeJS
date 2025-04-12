const express = require('express'); //import 
const path=require("path")// work with file and folder paths 
const app=express(); // create server or web app
const fs=require('fs');
var cors = require('cors')
const statusMonitor = require('express-status-monitor');
app.use(statusMonitor());
app.use(cors())
app.use(express.static("views"));
app.use(express.urlencoded({extended:true}));
app.post('/addstduent',function(req,res)
{
    let stduents=fs.readFileSync("students.json","utf-8");
    stduents=JSON.parse(stduents);
    console.log(req.body);
    stduents.push(req.body);
    fs.writeFileSync("students.json",JSON.stringify(stduents,null,2),'utf-8');
    //res.send("data is saved");
    res.redirect('/getstudents');

})
app.get('/',function(req,res)
{
    res.sendFile(path.join(__dirname,"index.html"));
})

app.get("/getstudents",function(req,res)
{
    res.sendFile(path.join(__dirname,"students.json"));
})

app.get("/student/:name",function(req,res)
{

    let name=req.params.name;
    let data= getStudents(name);
    if(data==undefined)
    {
        res.status(404).send('not found this name')
    }
    else
    res.send(data);

})

app.get("*",function(req,res)
{

    res.status(404).send("not found");
})

 app.listen(7000,function()
 {
    console.log("listen");
 })

const express = require('express');
const multer = require('multer');
const app = express();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Handle single file upload (field name: 'avatar')
app.post('/upload', upload.single('avatar'), (req, res) => {
  res.send('File uploaded successfully!');
});

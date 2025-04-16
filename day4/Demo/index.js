const express = require('express')
const multer = require('multer')
const DB = require('./DB');
const Joi = require('joi')

const app = express()
const port = 3000;

DB.ConnectDB();

const Schema  =Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
    avatar: Joi.string().required(),
    gender: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    role: Joi.string().required(),
    status: Joi.string().required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
})  


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + '-' + file.originalname // file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        cb(null,fileName)
    }
})

const upload = multer({ storage: storage })


app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.post('/upload', multer({ storage: storage }).single('file'), (req, res) => {
    res.send('Uploaded!')
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
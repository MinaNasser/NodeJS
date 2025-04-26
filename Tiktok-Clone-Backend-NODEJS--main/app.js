import express from 'express';
import Videos from './routes/videos.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ConnectDB from './utils/connectdb.js';
import cors from 'cors'
dotenv.config();
const port = process.env.PORT || 3000;
ConnectDB(process.env.CONNECT_URI);
const app = express();
app.use(express.json());
const WHITELISTEDAPPS = ['http://localhost:3000']
const corsOption = {
  origin:(origin,callback)=>{
        if(WHITELISTEDAPPS.indexOf(origin)!==-1){
          callback(null,true)
        }else{
          callback(new Error('permission not granted!'))
        }
  },
  optionsSucessStatus:200
}
app.use(cors(corsOption))
app.use(express.urlencoded({extended:false}));
app.get('/',(req,res)=>{
  res.send('WELCOME TO DANIEL TIKTOK BACKEND')
})
app.use('/videos',Videos);
mongoose.connection.on('open',()=>{
  app.listen(port);
  console.log('no connection error, port sucessfully created');
});

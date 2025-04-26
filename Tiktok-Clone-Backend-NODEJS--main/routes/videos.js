import express from 'express'
import VideoDB from '../schemas/Videos.js';
import handleNewVideo from '../controller/Postvideo.js';
import handleAllVideos from '../controller/sendAllvideos.js';
const Videos = express.Router()
Videos.route('/')
       .post(handleNewVideo)
       .get(handleAllVideos);


export default Videos;

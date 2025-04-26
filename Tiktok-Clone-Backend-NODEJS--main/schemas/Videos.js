import express from 'express'
import mongoose from 'mongoose'
const Schema = mongoose.Schema
const videoSchema = new Schema({
  link:{type:'string'},
  thumbnail:{type:'string'},
  likes:{type:'number'},
  shares:{type:'number'},
  videoOwnerInfo:{
    userid:{type:'string'},
    username:{type:'string'},
    userImageLink:{type:'string'}
 },
 videoDescription:{type:'string'}
})
const VideoDB = mongoose.model('video',videoSchema)
export default VideoDB;

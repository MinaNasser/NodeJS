import mongoose from "mongoose";
const ConnectDB = async(uri)=>{
  try {
    mongoose.connect(uri)
  } catch (error) {
   throw error
  }
}
export default ConnectDB

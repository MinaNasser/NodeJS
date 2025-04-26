import VideoDB from "../schemas/Videos.js";
const handleAllVideos = (req,res)=>{
  const sendAllvideos = async ()=>{
    const data = await VideoDB.find();
    res.send(JSON.stringify(data))
  };
  sendAllvideos()
}
export default handleAllVideos;

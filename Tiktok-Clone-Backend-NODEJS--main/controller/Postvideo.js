import VideoDB from "../schemas/Videos.js";

const handleNewVideo = async(req,res)=>{
  const {thumbnail,link,userid,userImageLink,username,videoDescription} = req.body;
  await VideoDB.create({
    link:link,
    likes:0,
    shares:0,
    thumbnail:'https://example.com/',
    videoOwnerInfo:{
      userid:userid,
      username:username,
      userImageLink:userImageLink
    },
    videoDescription:videoDescription
  })
 }

export default handleNewVideo;

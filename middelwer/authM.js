const userModel=require("../dataBase/models/users.js");
const jwt=require("../util/jwt.js");



async function authMiddleware(req,res,next){
const token=req.headers["authorization"];
const data=jwt.verifytoken(token);
if(!data){
    res.json("your token is invalid");
    return;
}
const id=data.id;
const user= await userModel.findOne({_id:id});
if(!user)
{
           res.json("your token is invalid");
           return;
}


req.user=user;

next();

}

module.exports=authMiddleware;
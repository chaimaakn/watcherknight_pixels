const jwt =require("jsonwebtoken");



function genertatoken(id){
   const Token= jwt.sign({
      id,

    },process.env.JWT_SECRET,

   );

    return Token;
}



function verifytoken(token){
try{
const data = jwt.verify(token,process.env.JWT_SECRET);
return(data);

}

catch{
     
return(null);
}
}

module.exports={
   genertatoken,
   verifytoken};
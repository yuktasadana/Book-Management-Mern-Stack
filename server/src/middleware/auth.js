const jwt= require("jsonwebtoken")
const authenticate= async function(req,res,next){
    try{
    let token = req.headers.authorization
    if(!token){
        return res.status(400).send({status:false, message:"token must be present login required"})
    }
      jwt.verify(token,"group21" ,function(error,decodedToken){
       if(error){
        if(error.message=="jwt expired"){ 
            return res.status(401).send({status:false,message:"token has been expired"})
        }
        else
            {return res.status(401).send({status:false,message:"invalid token "})}
          }
            req.token = decodedToken 
            next()
        })
    }
    catch(error){
        return res.status(500).send({status:false, message:error.message})
    }   
}
module.exports.authenticate=authenticate
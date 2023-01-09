const userModel = require('../models/userModel')
const validations= require("../validations/validation")
const jwt= require("jsonwebtoken")
let {isEmpty,isValidName,isValidEmail,isValidMobileNo,isValidPassword} = validations

//=================================================== REGISTER USERS =========================================//

const createUsers = async (req,res)=>{
 try{  
      console.log(req)
    let data= req.body
    let {title,phone,name,email,password}  = data

    if(Object.keys(data).length == 0){
        return  res.status(400).send({status: false,message:"request body can not be empty"})
    }
   
    if(!title){return res.status(400).send({status:false,message:"title is required"})}
    let titles = userModel.schema.obj.title.enum
    if(!titles.includes(title)){return  res.status(400).send({status: false,message:"Enter valid title 'Mr'/'Mrs'/ 'Miss'  "})}
    
    if(!name){return res.status(400).send({status:false,message:"name is required"})}
    if(isEmpty(name)){return res.status(400).send({status:false,message:"name can not be empty "})}
    if(!isValidName(name)){return  res.status(400).send({status: false,message:"Please Enter valid name"})}

    if(!phone){return res.status(400).send({status:false,message:"phone  is required"})}
    if(!isValidMobileNo(phone)){return  res.status(400).send({status: false,message:"Enter valid Phone number "})}
    let uniquePhone = await userModel.findOne({phone:phone})
    if(uniquePhone){return  res.status(400).send({status: false,message:"Phone number is already exists "})}
    
    if(!email){return res.status(400).send({status:false,message:"email is required"})}
    if(!isValidEmail(email)){return  res.status(400).send({status: false,message:"please enter valid email"})}
   let emailUnique = await userModel.findOne({email:email})
   if(emailUnique){return res.status(400).send({status:false,message:"email already exists"})}

   if(!password){return res.status(400).send({status:false,message:"password is required"})}
   let passwordUnique = await userModel.findOne({password:password})
   if(passwordUnique){return res.status(400).send({status:false,message:"password Should be Unique"})}

   if(!isValidPassword(password)){return  res.status(400).send({status: false,message:"Password should be minLen 8, maxLen 15 long and must contain one of 0-9,A-Z,a-z & special char"})}

  let address = {}
  address.city  = data.city
  address.street  = data.street
  address.pincode  = data.pincode
  
  data.address = address
  let createUserData = await userModel.create(data)
  return res.status(201).send({status: true, message: 'Success',data:createUserData})
}
catch(err){
   return res.status(500).send({status: false,message:err.message})
}
}

//============================================ USER LOGIN ==================================================///

const userLogin = async function(req, res) {
    try {
      const { email, password } = req.body;
      if (Object.keys(req.body).length == 0)
        return res.status(400).send({ status: false, message: "Enter Login Credentials." });
  
      if(!email) return res.status(400).send({ status: false, message: "Email Required." });  
      if(!isValidEmail(email)){return res.status(400).send({ status: false, message: " Email-Id is invalid"})};

      if(!password) return res.status(400).send({ status: false, message: "Password Required." });
      if(!isValidPassword(password)){return res.status(400).send({ status: false, message: "Password should be minLen 8, maxLen 15 long and must contain one of 0-9,A-Z,a-z & special char", })}

      let user = await userModel.findOne({ email: email, password: password }).select({ _id: 1 }); //user = 97887787
      // console.log(user)
      if(!user){return res.status(404).send({ status: false, message: " user is not found !!!" })};
      
///------------------------- generate jwt token--------------------//
        let token = jwt.sign({userId: user._id, iat: Date.now()}, "group21",{ expiresIn:"10h"}); //Math.floor(Date.now()) 
        res.setHeader("x-api-key", token);
        return res.status(200).send({ status: true, message: "Success",userId: user._id ,token: token }); 
      }
       catch (err) {   
        return res.status(500).send({ status: false, message:err.message });
      }
    }

module.exports = {createUsers,userLogin}
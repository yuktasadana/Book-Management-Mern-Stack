const express = require('express')
const route = express.Router()
const userController = require('../controllers/userController')
const bookController= require("../controllers/bookController")
const reviewController= require("../controllers/reviewController")
const middleware= require("../middleware/auth")
const aws = require("aws-sdk")

//==============================user apis=================================================//
route.post('/register', userController.createUsers)

route.post("/login",userController.userLogin)

//===============================book apis===============================================//

route.post("/books",middleware.authenticate,bookController.createBookData)

route.get('/books',bookController.getBooksData)

route.get("/books/:bookId",middleware.authenticate,bookController.fetchBookById)

route.put("/books/:bookId",middleware.authenticate,bookController.updateBooks)
 
route.delete("/books/:bookId",middleware.authenticate,bookController.deleteBookById)

//================================== review api================================================//

route.post("/books/:bookId/review",reviewController.createReviews)

route.put("/books/:bookId/review/:reviewId",reviewController.updateReviwews)

route.delete("/books/:bookId/review/:reviewId",reviewController.deleteReviews)

//===================================== AWS S3 ===================================================//

aws.config.update({
    accessKeyId:"AKIAY3L35MCRZNIRGT6N",
    secretAccessKey:"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",
    region:"ap-south-1"
})

//--------fileupload----------
let uploadFile = async (file)=>{
    return new Promise( function(resolve,reject){

        let s3 = new aws.S3({apiVersion:"2006-03-01"})
        var uplodParams ={
            ACL :"public-read",
            Bucket:"classroom-training-bucket",
            Key:"abc/"+file.originalname,
            Body:file.buffer
        }
        s3.upload(uplodParams,function(err,data){
            if(err){
                return reject({"error":err})
            }
            else{
                return resolve(data.Location)
            }
        })
    }
)}


module.exports.uploadFile = uploadFile
module.exports = route
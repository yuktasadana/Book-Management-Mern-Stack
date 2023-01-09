const reviewModel= require("../models/reviewModel")
const bookModel =  require("../models/bookModel");
const validations=require('../validations/validation');
//const { findById } = require("../models/reviewModel");

const {isValidObjectId,isEmpty}=validations
//========================================= create review for books =========================================//

const createReviews= async function(req,res){
    try{
        let bookId= req.params.bookId

        if(!bookId){ return res.status(400).send({status:false,message:"bookId is required"})}
        if(!isValidObjectId(bookId)){ return res.status(400).send({status:false, message:"bookId is invalid"})}
       
        let findBook = await bookModel.findById(bookId)
        if(!findBook){ return res.status(404).send({status:false,message:"book not found"})}
        if(findBook.isDeleted){ return res.status(400).send({status:false,message:"book is deleted"})}  

        let data = req.body
        let {rating}= data
        data.bookId= bookId
        
        if(Object.keys(data).length==0){
            return res.status(400).send({status:false,message:"data should be present in request body"})
        }
          
        if(!rating){ return res.status(400).send({status:false,message:"rating is mandatory"})}
        if(data.rating > 5 || data.rating < 1) { return res.status(400).send({ status: false, message: 'Rating should be between 1 to 5  ', }) }

    
       await  reviewModel.create(data)
       let reviewsData= await reviewModel.find({bookId:bookId}).select({__v:0}) 
       let updateBookData=await bookModel.findOneAndUpdate({_id:bookId,isDeleted:false},{$inc:{reviews:1}},{new:true}).lean()
       updateBookData.reviewsData=reviewsData
       return  res.status(201).send({ status: true, message: "success", data:  updateBookData})
        
    }   
    catch(error){
        return res.status(400).send({status:false,message:error.message})
    }
}

//===============================================update review of book ========================================///


const updateReviwews = async (req, res) => {
    try {
        let reviewerId = req.params.reviewId
        let bookId = req.params.bookId
        if (!bookId) { return res.status(400).send({ status: false, message: "bookId should be present" }) }
        if(!isValidObjectId(bookId)){ return res.status(400).send({status:false, message:"bookId is invalid"})}

        if (!reviewerId) { return res.status(400).send({ status: false, message: "reviewId should be present" }) }
        if(!isValidObjectId(reviewerId)){ return res.status(400).send({status:false, message:"reviewerId is invalid"})}

        let findBook = await bookModel.findById(bookId).select({ __v: 0}).lean()
            if(!findBook){ return res.status(404).send({status:false,message:"book not found"})}
        if(findBook.isDeleted){ return res.status(400).send({status:false,message:"book is deleted"})}  

        let findReview= await  reviewModel.findById(reviewerId).select({ __v: 0})
        if(!findReview){ return res.status(404).send({status:false, message:"review not found"})}
        if(findReview.isDeleted){  return res.status(400).send({status:false, message:"review is deleted ,can't be update"})}

        let reviewData = req.body
        let {review , rating , reviewedBy}=reviewData
        
        if(Object.keys(reviewData).length==0){
            return res.status(400).send({status:false,message:"data should be present in request body"})
        }
        if(reviewedBy ||reviewedBy==""){  
            if(isEmpty(reviewedBy)) {return res.status(400).send({status:false,message:"reviewedBy can not be empty"})}
        }
        if(review || review==""){
            if(isEmpty(review)){return res.status(400).send({status:false,message:"review can not be empty"})}
        }
        if (rating > 5 || rating < 1) { return res.status(400).send({ status: false, message: 'Rating should be between 1 to 5', }) }
      
        let updateReviews = await reviewModel.findOneAndUpdate(
            { _id: reviewerId },
            { $set: {review:review ,rating:rating ,reviewedBy:reviewedBy } },
            { new: true }).select({ __v: 0})
        findBook.reviewsData = updateReviews
        return res.status(200).send({ status: true, message: "Success", data: findBook })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

///=========================================== delete reviws ================================================//

const deleteReviews = async function (req,res){
    try{
        let reviewId = req.params.reviewId;
        let bookId = req.params.bookId

        if (!isValidObjectId(bookId)){return res.status(400).send({status:false, message:"bookId is not valid"})}
        if (!isValidObjectId(reviewId)){return res.status(400).send({status:false, message:"reviewId is not valid"})}

        let findBook =await bookModel.findById(bookId)
        if(!findBook){
               return res.status(404).send({status:false,massage:'Book does not exist'})
        } 
        if(findBook.isDeleted){ return res.status(400).send({status:false,message:"book is deleted"})}

        let findReview= await  reviewModel.findById(reviewId)
        if(!findReview){ return res.status(404).send({status:false, message:"review not found"})}
        if(findReview.isDeleted){ return res.status(400).send({status:false,message:" this review is already deleted"})}
        
    let deleteReview  = await reviewModel.findOneAndUpdate(
        { _id: reviewId },
        { $set: { isDeleted:true } },
        { new: true }
    )
    let updateData = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: -1 } }, { new: true }).lean()
    findBook.reviewsData = deleteReview 
    return res.status(200).send({ status: true, message: " deleted Successfully" })
    }
    catch(err){ 
        return res.status(500).send({status:false,message:err.massage});
    }
}

//-------------------------------------------------------------------------------------------------------------
module.exports.createReviews=createReviews
module.exports.updateReviwews = updateReviwews
module.exports.deleteReviews=deleteReviews
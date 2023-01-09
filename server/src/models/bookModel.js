const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
    title: {type:String, require:true, unique:true,trim:true},
    excerpt: {type:String, require:true,trim:true}, 
    userId: {type:ObjectId, require:true,ref:"UserDetails",trim:true},
    ISBN: {type:String, require:true, unique:true,trim:true},
    category:{type:String, require:true,trim:true},
    subcategory: {type:String, require:true,trim:true},
    reviews: {type:Number, default: 0, comment:String},
    deletedAt: {type:String}, 
    isDeleted: {type:Boolean, default: false},
    releasedAt: {type:String, require:true},
    bookCover:{type:String}
},{timestamps:true})

module.exports = mongoose.model("BookDetails",bookSchema)
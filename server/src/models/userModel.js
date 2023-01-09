const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    title: { type:String, require:true, enum:['Mr', 'Mrs', 'Miss'],trim:true},
    phone: {type:String, require:true, unique:true,trim:true},
    name: {type:String, require:true,trim:true},
    email: {type:String, require:true, unique:true,trim:true},
    password: {type:String, require:true,trim:true},         //string, mandatory, minLen 8, maxLen 15
    address: {street: {type:String},city: {type:String},pincode: {type:String}},
   
},{ timestamps: true})

module.exports = mongoose.model('UserDetails',userSchema)
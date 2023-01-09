const mongoose= require("mongoose")
//===================== Checking the input value is Valid or Invalid =====================//

const isEmpty = function (value) {
  return ((value.match(/^\s*$/) || []).length > 0)
 };
  
  //===================== NAME VALIDATION =====================//

  const isValidName = function (value) {
    return /^[a-zA-Z( \)]{2,50}$/.test(value);                       ///^[A-Za-z]+$\b/
  };  
  //============================ EMAIL VALIDATION ==========================================//

  const isValidEmail = function (value) {
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(value);
  };
//============================= MOBILE VALIDATION ===========================================//
  const isValidMobileNo = function (value) {
    return /^((\+91)?|91)?[789][0-9]{9}$/.test(value);
  };
//===================================== PASSWORD VALIDATION ======================================//
const isValidPassword = function(value){
   return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,15}$/.test(value)
};
//===================================== objectId validation ===================================//
const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
}
//======================================Date validation ========================================================//

function isDateValid(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateStr.match(regex) === null) {
    return false;
  }
  const date = new Date(dateStr);
  const timestamp = date.getTime();
  if(typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false;
  }
  return date.toISOString().startsWith(dateStr);
}
//================================ ISBN Validation ========================================================//

const isValidISBN = function(value){
  return /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/g.test(value)             ///(?:[0-9]{9}[0-9X]|[0-9]{13}|[0-9][0-9-]{11}[0-9X]|[0-9][0-9-]{15}[0-9])(?![0-9-])/
};

  module.exports = {isEmpty,isValidName,isValidEmail,isValidMobileNo,isValidPassword,isDateValid,isValidObjectId ,isValidISBN};
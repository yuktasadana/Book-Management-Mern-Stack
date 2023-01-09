const bookModel = require("../models/bookModel");
const userModel = require('../models/userModel')
const validations = require('../validations/validation')
const reviewModel = require("../models/reviewModel")
const route = require("../route/route")
const moment = require('moment')

const { isDateValid, isValidObjectId, isValidISBN, isEmpty } = validations

//==================================== create book data ============================================================//

const createBookData = async (req, res) => {
    try {
        let data = req.body
        let bookCover = req.files
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "data is madatory in request body" })
        }

        if (!userId) { return res.status(400).send({ status: false, message: "userId is  madatory " }) }
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "invalid userId" }) }

        let userIdInModel = await userModel.findById(userId)//null
        if (!userIdInModel) { return res.status(400).send({ status: false, message: "userId not exist " }) }

        //---authorization-------------------//
        if (req.token.userId !== userId) {
            return res.status(403).send({ status: false, message: "You are Not Authorized for openration" })
        }
        //---------------------------------//


        if (!title) { return res.status(400).send({ status: false, message: "title is  madatory " }) }
        let titleInModel = await bookModel.findOne({ title: title })
        if (titleInModel) { return res.status(400).send({ status: false, message: "title should be Unique " }) }

        if (!excerpt) { return res.status(400).send({ status: false, message: "excerpt is  madatory " }) }

        if (!ISBN) { return res.status(400).send({ status: false, message: "ISBN is  madatory " }) }
        let ISBNInModel = await bookModel.findOne({ ISBN: ISBN })
        if (ISBNInModel) { return res.status(400).send({ status: false, message: "ISBN should be Unique " }) }
        if (!isValidISBN(ISBN)) { return res.status(400).send({ status: false, message: "ISBN should be valid ,10 or 13 digits" }) }

        if (!category) { return res.status(400).send({ status: false, message: "category is madatory " }) }
        data.category = category.toLowerCase()

        if (!subcategory) { return res.status(400).send({ status: false, message: "subcategory is madatory " }) }
        data.subcategory = subcategory.toLowerCase()

        if (!releasedAt) { return res.status(400).send({ status: false, message: "releasedAt is madatory" }) }
        if (!isDateValid(releasedAt)) { return res.status(400).send({ status: false, message: "releasedAt date should be in  format YYYY-MM-DD ,2000-03-04" }) }


        if (bookCover && bookCover.length > 0) {
            let uploadFileUrl = await route.uploadFile(bookCover[0])
            data.bookCover = uploadFileUrl
        }
        else {
            return res.status(400).send({ msg: "Book Cover is mandatry" })
        }

        //realese at Time
        if (req.body.isDeleted) { data["realeseAt"] = moment().format() }

        let bookdata = await bookModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: bookdata })
    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//===================================== get books data ==============================================//

const getBooksData = async function (req, res) {
    try {
        let data = req.query;
        let { userId, category, subcategory } = data
        if (category != null) category = req.query.category.toLowerCase()
        if (subcategory != null) subcategory = req.query.subcategory.toLowerCase()

        if (userId || category || subcategory) {
            if (userId) { if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: " invalid userId plese Enter valid userId ...!" }) } }
            let filterBooks = await bookModel.find({ $and: [{ $or: [{ userId: userId }, { category: category }, { subcategory: subcategory }], isDeleted: false }] }).select({ __v: 0, createdAt: 0, updatedAt: 0 }).sort({ title: 1 })
            if (filterBooks.length == 0) { return res.status(404).send({ status: false, message: 'filterBooks Not found' }) }
            return res.status(200).send({ status: true, message: 'Books list', data: filterBooks })
        }
        else {
            let books = await bookModel.find({ isDeleted: false }).select({ __v: 0, createdAt: 0, updatedAt: 0 }).sort({ title: 1 })
            if (books.length == 0) { return res.status(404).send({ status: false, message: 'Books Not found' }) }
            return res.status(200).send({ status: true, message: 'Books list', data: books })
        }
    }
    catch (err) {
        res.status(500).send({ message: err.message })
    }
}
//============================================== Get books with reviews data =======================================//

const fetchBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId
        if (!bookId) { return res.status(400).send("bookid is not present") }
        if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: " invalid bookId plese Enter again ...!" }) }

        let books = await bookModel.findOne({ $and: [{ _id: bookId, isDeleted: false }] }).select({ __v: 0 }).lean()
        if (!books) { return res.status(404).send({ status: false, message: "book not found" }) }

        let Reviews = await reviewModel.find({ $and: [{ bookId: bookId, isDeleted: false }] }).select({ __v: 0 })
        books.reviewsData = Reviews
        books.reviews = Reviews.length
        return res.status(200).send({ status: true, message: 'Books list', data: books })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//============================================= Update books by bookId=============================================///

const updateBooks = async function (req, res) {
    try {
        let data = req.body
        const bookId = req.params.bookId
        let { title, excerpt, releasedAt, ISBN } = data   // 

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "data should be present in request body" })
        }

        if (!bookId) { return res.status(400).send({ status: false, message: "bookId should be present" }) }
        if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: "invalid bookId" }) }

        let findBook = await bookModel.findById(bookId)
        if (!findBook) { return res.status(404).send({ status: false, message: "book not found" }) }
        if (findBook.isDeleted == true) { return res.status(400).send({ status: false, message: "book is already deleted" }) }

        //-----------authorization--------------//
        let userId = findBook.userId.toString()
        if (req.token.userId !== userId) {
            return res.status(403).send({ status: false, message: "not authorised" })
        }
        //--------------------------------------------------------//

        if (isEmpty(title)) { return res.status(400).send({ status: false, message: "title can not be empty" }) }
        if (findBook.title == title) { return res.status(400).send({ status: false, message: "title should be unique" }) }

        if (isEmpty(excerpt)) { return res.status(400).send({ status: false, message: "excerpt can not be empty" }) }
        if (findBook.excerpt == excerpt) { return res.status(400).send({ status: false, message: "excerpt should be unique" }) }


        if (!isDateValid(releasedAt)) { return res.status(400).send({ status: false, message: "releasedAt date should be in  format YYYY-MM-DD ,2022-03-04" }) }
        if (findBook.releasedAt == releasedAt) { return res.status(400).send({ status: false, message: "releasedAt should be uniqe" }) }

        if (isEmpty(ISBN)) { return res.status(400).send({ status: false, message: "ISBN can not be empty" }) }
        if (!isValidISBN(ISBN)) { return res.status(400).send({ status: false, message: "ISBN should be valid" }) }
        if (findBook.ISBN == ISBN) { return res.status(400).send({ status: false, message: "ISBN should be uniqe" }) }

        let updateBooks = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN } },
            { new: true }
        ).select({ __v: 0 })
        return res.status(200).send({ status: true, message: "Success", data: updateBooks })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

//====================================================== Delete book by BookId=======================================//

const deleteBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        if (!bookId) { return res.status(400).send({ status: false, message: "BookId is required" }) }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Enter valid bookId" })
        }
        let book = await bookModel.findById(bookId)
        if (!book) {
            return res.status(404).send({ status: false, message: "this book is not present" });
        };
        if (book.isDeleted) { return res.status(404).send({ status: false, message: " book is already deleted" }) }
        //-------authoraization----------------//
        let userId = book.userId.toString()
        if (req.token.userId !== userId) {
            return res.status(403).send({ status: false, message: "not authorized" })
        }
        //-------------------------------------------//

        let deleteBook = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: { isDeleted: true, deletedAt: moment().format("YYYY-MM-DD") } },
            { new: true }).select({ __v: 0 })

        return res.status(200).send({ status: true, message: "success", data: deleteBook })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
};

module.exports.getBooksData = getBooksData
module.exports.createBookData = createBookData
module.exports.updateBooks = updateBooks
module.exports.deleteBookById = deleteBookById
module.exports.fetchBookById = fetchBookById 
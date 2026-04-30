import { Book } from "../models/book.model.js"
import { Transaction } from "../models/transaction.model.js"

const addBook = async (req, res) => {
    const { title, total_copies, price } = req.body
    if (!title || !total_copies || !price) {
        return res.status(500).json({ error: "Book title, copies, and price is required" })
    }
    const bookAdded = await Book.create({
        title: title,
        total_copies: total_copies,
        available_copies: total_copies,
        price: price
    })
    if (!bookAdded) {
        return res.status(501).json({ error: "Something went wrong ..." })
    }

    return res.status(200).json(bookAdded)

}

const getBooks = async (req, res) => {
    try {
        const allBookData = await Book.find()
        return res.status(200).json({
            message: "Books fetched successfully!",
            books: allBookData
        })
    } catch (error) {
        return res.status(500).json({ error: "Could not fetch books from database" })
    }

}
const getStudTransaction = async (req, res) => {
    try {
        const studAllBooksData = await Transaction.find({ student_id: req.user._id })
        return res.status(200).json({
            message: "Student All Transactions",
            transactionsData: studAllBooksData
        })
    } catch (error) {
        return res.status(500).json({ error: "Could not fetch student details" })
    }
}

const requestBook = async (req, res) => {
    // we cant give student the same book request again...means when the status is 'borrowRequested','borrowed','returnRequested' we stop the same book request until the status is 'returned'
    try {
        const bookId = String(req.params.bookId)
        const stdId = req.user._id
        const notAllowedReq = ['borrowRequested', 'borrowed', 'returnRequested']

        if (!bookId) {
            return res.status(500).json({ error: "Book id is required" })
        }

        // const doStudentReRequest = await Transaction.find({
        //     student_id: stdId,
        //     book_id: bookId,
        //     status: { $in: notAllowedReq }
        // })
        // if (doStudentReRequest.length > 0) {
        //     return res.status(406).json({ error: "Student Already have same book, so cant re request!" })
        // }
        const doStudentReRequest = await Transaction.findOne({
            student_id: stdId,
            book_id: bookId,
            status: { $in: notAllowedReq }
        })
        if (doStudentReRequest) {
            return res.status(406).json({ error: "Student Already have same book, so cant re request!" })
        }
        
        const bookDetails = await Book.findById(bookId)
        if (!bookDetails) {
            return res.status(500).json({ error: "Book details not found... Enter valid details" })
        }
        if (bookDetails.available_copies <= 0) {
            return res.status(400).json({ error: "Sorry, this book is currently out of stock!" });
        }
        const bookReqTra = await Transaction.create({
            student_id: stdId,
            book_id: bookId,
            // we can add status but default is already good
        })
        if (!bookReqTra) {
            return res.status(501).json({ error: "Something went wrong ..." })
        }

        res.status(200).json({
            message: "Book request Successfull",
            reqDetails: bookReqTra
        })

    } catch (error) {
        return res.status(500).json({ error: "Could not request the book", error })
    }


}

const getPendingTransaction = async(req,res)=>{
    try {
        const filterReq = ['borrowRequested', 'returnRequested']
        const pendingThings = await Transaction.find({
            status: { $in: filterReq }
        })

        return res.status(200).json({
            message:"All Pending Transactions",
            data:pendingThings
        })

    } catch (error) {
        return res.status(500).json({ error: "Could not fetch the data" })
    }
}







export { addBook, getBooks, requestBook, getStudTransaction,getPendingTransaction }
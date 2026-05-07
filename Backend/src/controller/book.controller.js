import { Book } from "../models/book.model.js"
import { Student } from "../models/student.model.js"
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
        }).populate("student_id", "name email rollNo class")
        .populate("book_id", "title price available_copies")
        
        // for(let i=0;i<pendingThings.length;i++){
        //     const sid = await Student.findById(pendingThings[i].student_id)
        //     const bid = await Book.findById(pendingThings[i].book_id)
        //     pendingThings[i].add(student details and book details!!)
        // }
        
        return res.status(200).json({
            message:"All Pending Transactions",
            data:pendingThings
        })

    } catch (error) {
        return res.status(500).json({ error: "Could not fetch the data" })
    }
}


const approveBook = async(req,res)=>{
    try {
        const transactionId = req.params.transactionId
        if (!transactionId) {
            return res.status(400).json({error:"Invalid Transaction ID"})
        }
        const trDB = await Transaction.findById(transactionId)
        if (!trDB) {
            return res.status(404).json({error:"Invalid Transaction ID"})
        }
        if (trDB.status!="borrowRequested") {
            return res.status(406).json({error:"Book already approved or something went wrong ..."})
        }
        const bookDB = await Book.findById(trDB.book_id)
        if (!bookDB || bookDB.available_copies <= 0) {
            return res.status(400).json({error: "Cannot approve: Book is out of stock!"})
        }
        bookDB.available_copies-=1
        await bookDB.save()

        trDB.issued_by = req.user._id
        trDB.issue_date = Date.now()
        trDB.status = "borrowed"

        await trDB.save()
        return res.status(200).json({
            message:"Book is approved",
            data:trDB
        })

    } catch (error) {
        return res.status(500).json({error:"Not able to approve book... try later"})
    }

}

const reqReturnBook = async (req,res) => {
    try {
        // const bookID = req.params.bookId
        const transactionIDD = req.params.transactionId
        const stdId = req.user._id
        // verify is the return student is same as req.. one?? 
        // verify is the request of book is borrowed ..if not then cant return request
        // const trrDB = await Transaction.findOne({
        //     student_id:stdId,
        //     book_id:bookID
        // })
        const trrDB = await Transaction.findById(transactionIDD)
        // instead of bookid we can also make transaction id in url... 
        // if (!trrDB) {
        //     return res.status(406).json({error:"Invalid student or book details"})
        // }
        if (!trrDB) {
            return res.status(406).json({error:"Invalid transaction details"})
        }
        if (trrDB.student_id.toString() !== stdId.toString()) {
            return res.status(403).json({error: "Student details mismatch !!"})
        }
        if (trrDB.status!="borrowed") {
            return res.status(406).json({error:"Cant send the request of return"})
        }
    
        trrDB.status = "returnRequested"
        trrDB.return_date = Date.now()
        await trrDB.save()
        
        return res.status(200).json({
            message:"Return request send sucessfully!"
        })
    } catch (error) {
        return res.status(500).json({error:"Something went wrong ..."})
    }

}

const returnBook = async(req,res)=>{
    try {

        const transactionId = req.params.transactionId
        if (!transactionId) {
            return res.status(400).json({error:"Invalid Transaction ID"})
        }
        const trDB = await Transaction.findById(transactionId)
        if (!trDB) {
            return res.status(404).json({error:"Invalid Transaction ID"})
        }
        if (trDB.status!="returnRequested") {
            return res.status(406).json({error:"Cant return book as status is not return request"})
        }
        const bookDB = await Book.findById(trDB.book_id)
        if (!bookDB) {
            return res.status(400).json({error: "Cannot return invalid book id"})
        }
        bookDB.available_copies+=1
        await bookDB.save()

        trDB.collected_by = req.user._id
        trDB.status = "returned"

        await trDB.save()
        return res.status(200).json({
            message:"Book is returned successfully !!!",
            data:trDB
        })
    } catch (error) {
        return res.status(500).json({error:"Something went wrong ..."})
    }
}


export { addBook, getBooks, requestBook, getStudTransaction,getPendingTransaction,approveBook,reqReturnBook,returnBook }
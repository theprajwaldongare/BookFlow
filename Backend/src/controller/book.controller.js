import { Book } from "../models/book.model.js"

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

export { addBook, getBooks }
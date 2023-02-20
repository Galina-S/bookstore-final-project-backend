import Book from "./Book.js";


const getAllBooks = async (req, res) => {
    try {
        const getAllBooks = await Book.find();
        return res.status(200).json(getAllBooks)
    } catch (err) {
        res.status(500).send(err)
    }
};
const getOneBook = async (req, res) => {
    try {
        const bookId = req.params.id
        if (!bookId) {
             res.status(400).json({ message: 'Not found'}) /** testen */
        } 
        const getOne = await Book.findById(bookId);
        return res.status(200).json(getOne);

    } catch (err) {
        res.status(500).send(err);
    }
};



const addNewBook = async (req, res) => {
    try {
        const addBook = await Book.create(req.body);
        return res.status(200).json(addBook);
    } catch (err) {
        res.status(500).send(err);
    }
};

const deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        if (!bookId) {
            res.status(400).json({ 
                error: true,
                message: `Book with id ${bookId} does not exist. Delete failed`
            }) /** testen */            
        }
        const deleteBook = await Book.findByIdAndDelete(bookId)
        return res.json(deleteBook)
    } catch (err) {
        res.status(500).send(err)
    }
};

const updateBook = async (req, res) => {
    try {
        const book = req.body;
        if (!book._id) {
            res.status(400).json({ message: 'ID Not found'}) /** testen */            
        }
        const updateOneBook = await Book.findByIdAndUpdate(book._id, book)
        return res.json(updateOneBook)
    } catch (err) {
        res.status(500).send(err)
    }
};



export { getAllBooks, addNewBook, getOneBook, updateBook, deleteBook }
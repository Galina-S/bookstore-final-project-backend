import express from "express";
import {getAllBooks, addNewBook, getOneBook, updateBook, deleteBook} from "./controller.js";


const router = express.Router();

router.get("/books", getAllBooks);

router.get('/books/:id', getOneBook);

router.post("/books", addNewBook)

router.put('/books', updateBook);

router.delete('/books/:id', deleteBook);


export default router;
import express from "express";


import {
  getAllBooks,
  addNewBook,
  getOneBook,
  updateBook,
  deleteBook,
  loginUser,
  getCurrentUser,
  registerNewUser,
  //updateBookViews

} from "./controller.js";

const router = express.Router();

router.get("/books", getAllBooks);

router.get("/books/:id", getOneBook);

router.post("/books", addNewBook);

router.put("/books/:id", updateBook);

router.delete("/books/:id", deleteBook);


router.post("/login", loginUser);

router.get('/get-current-user', getCurrentUser);

router.post('/register', registerNewUser);



//router.put('/books/:id/views', updateBookViews);






export default router;

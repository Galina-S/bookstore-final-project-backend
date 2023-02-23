import express from "express";
import * as model from './controller.js';
import * as tools from './tools.js';

import {
  getAllBooks,
  addNewBook,
  getOneBook,
  updateBook,
  deleteBook,
  loginUser,
  getCurrentUser



} from "./controller.js";

const router = express.Router();

router.get("/books", getAllBooks);

router.get("/books/:id", getOneBook);

router.post("/books", addNewBook);

router.put("/books/:id", updateBook);

router.delete("/books/:id", deleteBook);


router.post("/login", loginUser);

router.get('/get-current-user', getCurrentUser);


export default router;

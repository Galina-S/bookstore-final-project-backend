import express from "express";
import User from "./src/models/User.js";
import Book from "./src/models/Book.js";

import {
  getAllBooks,
  addNewBook,
  getOneBook,
  updateBook,
  deleteBook,
  loginUser,
  getUserById,
  getCurrentUser,
  registerNewUser,
  findNovels,
  getFavorites,
  addToFavorites,
  newReleases,
  addNewComment,
  deleteComment,
  isBookFavorite,
  deleteFromFavorites,
  logoutUser,
  getAllBooksByAuthor,
  getAllComments,
  getUsernameFromUserId,
  getCart,
  addToCart,
} from "./controller.js";
import { getUser } from "./model.js";

const router = express.Router();

router.get("/books", getAllBooks);

router.get("/books/:id", getOneBook);

router.post("/books", addNewBook);

router.put("/books/:id", updateBook);

router.delete("/books/:id", deleteBook);

router.post("/login", loginUser);

router.get("/logout", logoutUser);

router.get("/get-current-user", getCurrentUser);

router.post("/register", registerNewUser);

router.get("/novels", findNovels);

router.post("/books/:id", addNewComment);

router.get("/new-books", newReleases);

//Favourites
router.get("/users/:userId/favorites", getFavorites);

router.post("/users/:userId/favorites/:bookId", addToFavorites);

router.get("/users/:userId/favorites/:bookId", isBookFavorite);

router.post("/books/:id", addNewComment);

router.delete("/books/:bookId/comments/:commentId", deleteComment);

router.delete("/users/:userId/favorites/:bookId", deleteFromFavorites);

// Get user by ID
router.get("/users/:id", getUserById);

//Cart
router.get("/users/:userId/cart", getCart);

router.post("/users/:userId/cart/:bookId", addToCart);

// Define a route for getting all books grouped by author
router.get("/authors/:authorID", getAllBooksByAuthor);

//get all Comments
router.get("/books/:bookId/comments", getAllComments);

router.get("/users/:userId/username", getUsernameFromUserId);

export default router;

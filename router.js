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
  getCurrentUser,
  // registerNewUser,
  findNovels,
  getFavorites,
  addToFavorites,
  //updateBookViews
  newReleases,

} from "./controller.js";

const router = express.Router();

router.get("/books", getAllBooks);

router.get("/books/:id", getOneBook);

router.post("/books", addNewBook);

router.put("/books/:id", updateBook);

router.delete("/books/:id", deleteBook);


router.post("/login", loginUser);

router.get('/get-current-user', getCurrentUser);

// router.post('/register', registerNewUser);

router.get("/novels", findNovels);


router.get("/users/:userId/favorites", getFavorites);
// router.post("/users/:userId/favorites", addToFavorites);

router.get("/new-books", newReleases)

router.post('/users/:userId/favorites/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;
  // console.log("BookID", bookId);
  // console.log("userId", userId);
  try {
    const user = await User.findById(req.params.userId);
    //const user = req.session.user;  Retrieve the user from the session
    if (!user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!user.favorites.includes(bookId)) {
      user.favorites.push(bookId);
      await user.save(); // Save the updated user document in the database
      console.log(user.favorites)
      req.session.user = user; // Update the user in the session
      res.json({ message: 'Book added to favorites' });
    } else {
      res.json({ message: 'Book is already in favorites' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/:userId/favorites/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;

  try {
    //const user = req.session.user; // Retrieve the user from the session
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const isFavorite = user.favorites.includes(bookId);

    res.json({ isFavorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.delete('/users/:userId/favorites/:bookId', async (req, res) => {
  const { userId, bookId } = req.params;
  
  try {
    const user = await User.findById(req.params.userId);
    //const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const index = user.favorites.indexOf(bookId);
    if (index === -1) {
      res.status(404).json({ message: 'Book not found in favorites' });
      return;
    }

    user.favorites.splice(index, 1);
    await user.save();

    res.json({ message: 'Book removed from favorites' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'User is not authenticated' });
};

// Route to get authenticated user's information
// router.get('/me', isAuthenticated, (req, res) => {
//   res.json(req.user);
// });

export default router;
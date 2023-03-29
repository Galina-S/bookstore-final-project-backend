import User from "./src/models/User.js";
import Book from "./src/models/Book.js";
import Comment from "./src/models/Comment.js";
import * as model from "./model.js";
import * as tools from "./tools.js";
import * as config from "./config.js";
import bcrypt from "bcrypt";

const findNovels = async (req, res) => {
  try {
    const novels = await Book.find({
      category: {
        $regex: "Liebe|Frau|Frauen|Liebesroman|Gefühl",
        $options: "i",
      },
    });
    return res.status(200).json(novels);
  } catch (err) {
    res.status(500).send(err);
  }
};
const newReleases = async (req, res) => {
  try {
    const _newReleases = await Book.find({
      puplication: { $gte: new Date("2023-01-01") },
    }).sort({ puplication: "asc" });
    return res.status(200).json(_newReleases);
  } catch (err) {
    res.status(500).send(err);
  }
};

const getAllBooks = async (req, res) => {
  try {
    const getAllBooks = await Book.find();
    return res.status(200).json(getAllBooks);
  } catch (err) {
    res.status(500).send(err);
  }
};

const getOneBook = async (req, res) => {
  const bookId = req.params.id;
  let book;
  try {
    book = await Book.findOneAndUpdate(
      { _id: bookId },
      {
        $inc: { viewsCount: 1 }, //increment
      },
      {
        returnDocument: "after", //return an actual doc after update
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Could not get any book" });
  }
  if (!book) {
    return res.status(404).json({ message: "No book found" }); /** testen */
  }
  return res.status(200).json({ book });
};

const addNewBook = async (req, res) => {
  const {
    author,
    img,
    title,
    description,
    price,
    ISBN,
    puplication,
    category,
    publisher,
    pages,
    viewsCount,
  } = req.body;
  let book;
  try {
    book = await Book.create({
      author,
      img,
      title,
      description,
      price,
      ISBN,
      puplication,
      category,
      publisher,
      pages,
      viewsCount,
    });

    await book.save();
  } catch (err) {
    console.log(err);
  }
  if (!book) {
    return res
      .status(500)
      .json({ message: "Unable to Add new Book" }); /** testen */
  }
  return res.status(201).json({ book });
};

const addNewComment = async (req, res) => {
  const {
    commentId,
    userId,
    bookId,
    title,
    content,
    dateCreated,
    dateModified,
  } = req.body;
  let comment;
  try {
    comment = await Comment.create({
      commentId,
      userId,
      bookId,
      title,
      content,
      dateCreated,
      dateModified,
    });
    await comment.save();
  } catch (err) {
    console.log(err);
  }
  if (!comment) {
    return res
      .status(500)
      .json({ message: "Unable to Add new Comment" }); /** testen */
  }
  return res.status(201).json({ comment });
};

const updateBook = async (req, res) => {
  const bookId = req.params.id;
  let book;
  const {
    author,
    img,
    title,
    description,
    price,
    ISBN,
    puplication,
    category,
    publisher,
    pages,
    viewsCount,
  } = req.body;
  try {
    book = await Book.findByIdAndUpdate(bookId, {
      author,
      img,
      title,
      description,
      price,
      ISBN,
      puplication,
      category,
      publisher,
      pages,
      viewsCount,
    });
    book = await book.save();
  } catch (err) {
    console.log(err);
  }
  if (!bookId) {
    return res
      .status(404)
      .json({ message: "Unable to update by this ID" }); /** testen */
  }
  return res.status(201).json({ book });
};

const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!bookId) {
      res.status(400).json({
        error: true,
        message: `Book with id ${bookId} does not exist. Delete failed`,
      }); /** testen */
    }
    const deleteBook = await Book.findByIdAndDelete(bookId);
    return res.status(200).json({ message: "Book successfully deleted" });
  } catch (err) {
    res.status(500).send(err);
  }
};

const deleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const bookId = req.params.bookId;
  const { userId } = req.body;

  // check if comment exists and user id matches

  if (!commentId) {
    return res.status(404).json({ error: "Comment not found" });
  }

  try {
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await model.getUser(username, password);
  // console.log(user)
  if (user !== null) {
    const passwordIsCorrect = await tools.passwordIsCorrect(
      password,
      user.hash
    );
    if (passwordIsCorrect) {
      const frontendUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        img: user.img,
        accessGroups: user.accessGroups,
        favorites: user.favorites,
      };
      //console.log(frontendUser)
      req.session.user = frontendUser;

      // Set the user ID in the session
      req.session.userId = user._id;

      req.session.cookie.expires = new Date(
        Date.now() + config.SECONDS_TILL_SESSION_TIMEOUT * 1000
      );
      req.session.save();
      res.status(200).send(frontendUser);
    } else {
      res.status(401).send("Bad password");
      const anonymousUser = await model.getAnonymousUser();
      res.status(200).send(anonymousUser);
    }
  } else {
    res.status(401).send("Bad username or both fields");
    const anonymousUser = await model.getAnonymousUser();
    res.status(200).send(anonymousUser);
  }
};

const registerNewUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      res.status(409).send("User already exists!");
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        email,
        hash: hashedPassword,
        comments: [],
        img: "https://i.ibb.co/0FnL399/no-image.jpg",
        accessGroups: ["members"],
        favorites: [],
      });

      await user.save();
      res.status(200).json({ message: "Registration successful." });
      // res.status(200).send('User created successfully!');
    }
  } catch (err) {
    // res.status(500).send(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    res.json({ username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while retrieving the user");
  }
};

const getCurrentUser = async (req, res) => {
  if (req.session.user) {
    res.send(req.session.user);
  } else {
    const anonymousUser = await model.getAnonymousUser();
    res.status(200).send(anonymousUser);
  }
};

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send("ERROR");
    } else {
      res.send("logged out");
    }
  });
};

const addToFavorites = async (req, res) => {
  const { userId, bookId } = req.params;
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!user.favorites.includes(bookId)) {
      if (user.username === "anonymousUser" && user.favorites.length >= 6) {
      } else {
        user.favorites.push(bookId);
      }

      await user.save(); // Save the updated user document in the database
      console.log(user.favorites);
      req.session.user = user; // Update the user in the session
      res.json({ message: "Book added to favorites" });
    } else {
      res.json({ message: "Book is already in favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const isBookFavorite = async (req, res) => {
  const { userId, bookId } = req.params;

  try {
    //const user = req.session.user; // Retrieve the user from the session
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const isFavorite = user.favorites.includes(bookId);

    res.json({ isFavorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getFavorites = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    const user = await User.findById(req.params.userId);
    // const user = await User.findById(req.session.use);
    res.json(user.favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteFromFavorites = async (req, res) => {
  const { userId, bookId } = req.params;

  try {
    const user = await User.findById(req.params.userId);
    //const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const index = user.favorites.indexOf(bookId);
    if (index === -1) {
      res.status(404).json({ message: "Book not found in favorites" });
      return;
    }

    user.favorites.splice(index, 1);
    await user.save();

    res.json({ message: "Book removed from favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllBooksByAuthor = async (req, res) => {
  try {
    const authorID = req.params.authorID.replace("+", " "); // replace + with space
    const books = await Book.find({ author: authorID });
    res.json({ author: authorID, books });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllComments = async (req, res) => {
  const { bookId } = req.params;

  try {
    // Query the Comment model for all comments with the specified book ID
    const comments = await Comment.find({ bookId });

    // Send the comments as the response
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while retrieving comments");
  }
};
const getUsernameFromUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Query the User model for the user with the specified ID
    const user = await User.findOne({ userId });

    // Send the username as the response
    res.json(user.username);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while retrieving the username");
  }
};

const addToCart = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    const user = await User.findById(req.params.userId);
    if (!user.cartItems.includes(book._id)) {
      user.cartItems.push(book._id);
      await user.save();
      res.json({ message: "Book added to cart" });
    } else {
      res.json({ message: "Book is already in favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    const user = await User.findById(req.params.userId);
    // const user = await User.findById(req.session.use);
    res.json(user.cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getAllBooks,
  addNewBook,
  getOneBook,
  updateBook,
  deleteBook,
  loginUser,
  logoutUser,
  registerNewUser,
  getCurrentUser,
  findNovels,
  addToFavorites,
  getFavorites,
  newReleases,
  addNewComment,
  deleteComment,
  isBookFavorite,
  deleteFromFavorites,
  getUserById,
  getAllBooksByAuthor,
  getAllComments,
  getUsernameFromUserId,
  addToCart,
  getCart,
};

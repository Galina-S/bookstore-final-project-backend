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
        img: "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",
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

const removeFromCart = async (req, res) => {
  const { userId, bookId } = req.params;

  try {
    const user = await User.findById(req.params.userId);
    //const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const index = user.cartItems.indexOf(bookId);
    if (index === -1) {
      res.status(404).json({ message: "Book not found in cart" });
      return;
    }

    user.cartItems.splice(index, 1);
    await user.save();

    res.json({ message: "Book removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by ID
    const user = await User.findByIdAndUpdate(req.params.userId, { email });

    // Update the email address and save the user
    user.email = email;
    await user.save();

    res.status(200).send({ message: "Email updated successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "An error occurred while updating the email." });
  }
};



 const updateProfileImage = async (req, res) => {

  try{ 
    const userId = req.params.userId;
    const { imageData } = req.body;
     console.log(req.params.userId)
  // Update the user's profile image in the database
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { img: imageData },
    { new: true }
  );



  // // Update the img  and save the user
  // user.img = imageData;
  // await user.save();

  res.status(200).send({ message: "Profile Image updated successfully." });

} catch (error) {
  console.log(error);
  res.status(500).json({ error: "Internal server error" });
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
  removeFromCart,
  updateEmail,
  updateProfileImage
};

import Book from "./src/models/Book.js";
//import User from './src/models/User.js';
import * as model from './model.js';
import * as tools from './tools.js';
import * as config from './config.js';

const getAllBooks = async (req, res) => {
  try {
    const getAllBooks = await Book.find();
    return res.status(200).json(getAllBooks);
  } catch (err) {
    res.status(500).send(err);
  }
};
const getOneBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!bookId) {
      res.status(400).json({ message: "Not found" }); /** testen */
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
        message: `Book with id ${bookId} does not exist. Delete failed`,
      }); /** testen */
    }
    const deleteBook = await Book.findByIdAndDelete(bookId);
    return res.json(deleteBook);
  } catch (err) {
    res.status(500).send(err);
  }
};

const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = req.body;
    if (!bookId) {
      res.status(400).json({ message: "ID Not found" }); /** testen */
    }
    const updateOneBook = await Book.findByIdAndUpdate(bookId, book);
    return res.json(updateOneBook);
  } catch (err) {
    res.status(500).send(err);
  }
};

const registerNewUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }
    // Store the data in a database
    // ...
    return res.status(200).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).send(err);
  }
};

const loginUser =  async (req, res) => {
	const { username, password } = req.body;
	const user = await model.getUser(username, password);
  console.log(user)
	if (user !== null) {
		const passwordIsCorrect = await tools.passwordIsCorrect(password, user.hash);
		if (passwordIsCorrect) {

      const frontendUser = {
				_id: user._id,
				username: user.username,
				email: user.email,
			}
      //console.log(frontendUser)
			req.session.user = frontendUser;
			req.session.cookie.expires = new Date(Date.now() + config.SECONDS_TILL_SESSION_TIMEOUT * 1000);
			req.session.save();
			res.status(200).send(frontendUser);
		} else {
			res.status(401).send('Bad password');
		}
	} else {
		res.status(401).send('Bad username or both fields');
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

export { getAllBooks, addNewBook, getOneBook, updateBook, deleteBook, registerNewUser, loginUser, getCurrentUser};
